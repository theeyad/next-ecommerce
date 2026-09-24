import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("Missing stripe-signature or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Missing webhook signature or secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const supabaseAdmin = createAdminClient();

      const paymentIntentId = (session.payment_intent as string) || session.id;
      const totalAmount = (session.amount_total || 0) / 100;

      // 1. Idempotency Check: Check if order already processed
      const { data: existingOrder } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();

      if (existingOrder) {
        console.log(`Order already processed for payment intent ${paymentIntentId}`);
        return NextResponse.json({ received: true });
      }

      // Reconstruct shippingAddress from discrete metadata keys
      const shippingAddress = {
        fullName: session.metadata?.shipping_fullName || "",
        email: session.metadata?.shipping_email || session.customer_email || "",
        phone: session.metadata?.shipping_phone || "",
        addressLine1: session.metadata?.shipping_addressLine1 || "",
        city: session.metadata?.shipping_city || "",
        postalCode: session.metadata?.shipping_postalCode || "",
        country: session.metadata?.shipping_country || "",
      };

      const userId = session.metadata?.user_id || null;

      // 2. Fetch Line Items from Stripe Session to audit stock
      const expandedLineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { expand: ["data.price.product"] }
      );

      const catalogItems: Array<{
        productId: string;
        productName: string;
        unitPrice: number;
        quantity: number;
        subtotal: number;
      }> = [];

      for (const item of expandedLineItems.data) {
        const productObj = item.price?.product as Stripe.Product | undefined;
        const productId = productObj?.metadata?.product_id || null;

        if (!productId) continue; // Skip non-catalog items (e.g. shipping/tax)

        catalogItems.push({
          productId,
          productName: item.description || "Product",
          unitPrice: (item.price?.unit_amount || 0) / 100,
          quantity: item.quantity || 1,
          subtotal: (item.amount_subtotal || 0) / 100,
        });
      }

      // 3. Stock Audit: Check if any item was oversold concurrently
      let isOversold = false;
      const productIds = catalogItems.map((ci) => ci.productId);

      if (productIds.length > 0) {
        const { data: dbProducts } = await supabaseAdmin
          .from("products")
          .select("id, stock_quantity")
          .in("id", productIds);

        for (const item of catalogItems) {
          const dbProd = dbProducts?.find((p) => p.id === item.productId);
          if (!dbProd || dbProd.stock_quantity < item.quantity) {
            isOversold = true;
            break;
          }
        }
      }

      // 4. Handle Oversold Race Condition -> Automatic Refund Safety Net
      if (isOversold) {
        console.warn(
          `Oversold condition detected for PaymentIntent ${paymentIntentId}. Initiating automatic Stripe refund...`
        );

        // Issue full refund via Stripe API
        if (session.payment_intent && typeof session.payment_intent === "string") {
          await stripe.refunds.create({
            payment_intent: session.payment_intent,
          });
        }

        // Record cancelled/refunded order for auditing
        await supabaseAdmin.from("orders").insert({
          user_id: userId ? userId : null,
          status: "cancelled",
          total_amount: totalAmount,
          stripe_payment_intent_id: paymentIntentId,
          shipping_address: {
            ...shippingAddress,
            note: "Oversold stock race condition - Automatic refund processed via Stripe.",
          },
        });

        return NextResponse.json({
          received: true,
          message: "Oversold stock - Order cancelled and automatically refunded.",
        });
      }

      // 5. Insert Valid Paid Order
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: userId ? userId : null,
          status: "paid",
          total_amount: totalAmount,
          stripe_payment_intent_id: paymentIntentId,
          shipping_address: shippingAddress,
        })
        .select("id")
        .single();

      if (orderError || !order) {
        // Handle postgres unique constraint race condition gracefully (PostgreSQL 23505)
        if (orderError?.code === "23505") {
          console.log(`Concurrent order creation prevented by UNIQUE constraint for ${paymentIntentId}`);
          return NextResponse.json({ received: true });
        }

        console.error("Failed to insert order into DB:", orderError);
        return NextResponse.json(
          { error: `Database Order Insert Error: ${orderError?.message}` },
          { status: 500 }
        );
      }

      // 6. Insert Order Items & Execute Atomic Stock Decrement via RPC
      const orderItemsToInsert = catalogItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        product_price: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      if (orderItemsToInsert.length > 0) {
        const { error: itemsError } = await supabaseAdmin
          .from("order_items")
          .insert(orderItemsToInsert);

        if (itemsError) {
          console.error("Failed to insert order items into DB:", itemsError);
        }

        // Call atomic RPC function for each product (Conditional SQL Update)
        for (const item of catalogItems) {
          const { data: decrementSuccess, error: rpcErr } =
            await supabaseAdmin.rpc("decrement_product_stock", {
              p_id: item.productId,
              p_qty: item.quantity,
            });

          if (rpcErr || decrementSuccess === false) {
            console.warn(
              `Atomic stock decrement failed for product ${item.productId} in order ${order.id}. Microsecond race detected, initiating refund...`
            );

            if (
              session.payment_intent &&
              typeof session.payment_intent === "string"
            ) {
              await stripe.refunds.create({
                payment_intent: session.payment_intent,
              });
            }

            await supabaseAdmin
              .from("orders")
              .update({
                status: "cancelled",
                shipping_address: {
                  ...shippingAddress,
                  note: "Microsecond stock race condition - Automatic refund processed via Stripe.",
                },
              })
              .eq("id", order.id);

            return NextResponse.json({
              received: true,
              message: "Microsecond stock race - Order automatically refunded.",
            });
          }
        }
      }

      console.log(`Order ${order.id} successfully fulfilled via Stripe Webhook!`);
    } catch (err: any) {
      console.error("Error fulfilling order in webhook:", err);
      return NextResponse.json(
        { error: `Webhook Fulfillment Error: ${err.message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
