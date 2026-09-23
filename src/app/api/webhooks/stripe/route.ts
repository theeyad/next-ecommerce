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

      // Check if order already processed (idempotency check)
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

      // 1. Insert Order
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
        console.error("Failed to insert order into DB:", orderError);
        return NextResponse.json(
          { error: `Database Order Insert Error: ${orderError?.message}` },
          { status: 500 }
        );
      }

      // 2. Fetch Line Items from Stripe Session
      const expandedLineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { expand: ["data.price.product"] }
      );

      const orderItemsToInsert: Array<{
        order_id: string;
        product_id: string | null;
        product_name: string;
        product_price: number;
        quantity: number;
        subtotal: number;
      }> = [];

      for (const item of expandedLineItems.data) {
        const productObj = item.price?.product as Stripe.Product | undefined;
        const productId = productObj?.metadata?.product_id || null;

        // Skip non-catalog line items (such as flat shipping or tax)
        if (!productId) continue;

        const unitPrice = (item.price?.unit_amount || 0) / 100;
        const itemQuantity = item.quantity || 1;
        const itemSubtotal = (item.amount_subtotal || 0) / 100;

        orderItemsToInsert.push({
          order_id: order.id,
          product_id: productId,
          product_name: item.description || "Product",
          product_price: unitPrice,
          quantity: itemQuantity,
          subtotal: itemSubtotal,
        });

        // Decrement product stock quantity
        const { data: prod } = await supabaseAdmin
          .from("products")
          .select("stock_quantity")
          .eq("id", productId)
          .single();

        if (prod) {
          const updatedStock = Math.max(0, prod.stock_quantity - itemQuantity);
          await supabaseAdmin
            .from("products")
            .update({ stock_quantity: updatedStock })
            .eq("id", productId);
        }
      }

      if (orderItemsToInsert.length > 0) {
        const { error: itemsError } = await supabaseAdmin
          .from("order_items")
          .insert(orderItemsToInsert);

        if (itemsError) {
          console.error("Failed to insert order items into DB:", itemsError);
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
