"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema, checkoutSchemaType } from "@/lib/validation/checkout";
import { CartItem } from "@/lib/store/productsStore";
import {
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
} from "@/lib/constants/consts";

export async function createCheckoutSession(
  shippingDetails: checkoutSchemaType,
  cartItems: CartItem[]
) {
  try {
    // 1. Validate Form Input
    const validatedData = checkoutSchema.parse(shippingDetails);

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    // 2. Get User Auth Session (if logged in)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 2.5 Real-time Inventory Stock Audit
    const productIds = cartItems.map((item) => item.product.id);
    const { data: dbProducts, error: stockErr } = await supabase
      .from("products")
      .select("id, name, stock_quantity, is_active")
      .in("id", productIds);

    if (stockErr || !dbProducts) {
      return {
        success: false,
        error: "Failed to verify product stock. Please try again.",
      };
    }

    for (const item of cartItems) {
      const dbProd = dbProducts.find((p) => p.id === item.product.id);

      if (!dbProd || !dbProd.is_active) {
        return {
          success: false,
          error: `"${item.product.name}" is currently unavailable.`,
        };
      }

      if (item.quantity > dbProd.stock_quantity) {
        if (dbProd.stock_quantity === 0) {
          return {
            success: false,
            error: `"${dbProd.name}" is out of stock.`,
          };
        }
        return {
          success: false,
          error: `Only ${dbProd.stock_quantity} unit(s) of "${dbProd.name}" available in stock.`,
        };
      }
    }

    // 3. Compute Totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
    const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;
    const estimatedTax = subtotal * TAX_RATE;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 4. Format Line Items for Stripe
    const lineItems: any[] = cartItems.map((item) => {
      const primaryImg =
        item.product.product_images?.find((img) => img.is_primary)?.url ||
        item.product.product_images?.[0]?.url;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            description: item.product.description || undefined,
            images: primaryImg ? [primaryImg] : [],
            metadata: {
              product_id: item.product.id,
            },
          },
          unit_amount: Math.round(item.product.price * 100), // Stripe expects amount in cents
        },
        quantity: item.quantity,
      };
    });

    // Add Shipping Line Item if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Standard Shipping & Handling",
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add Estimated Tax Line Item if applicable
    if (estimatedTax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `Estimated Sales Tax (${(TAX_RATE * 100).toFixed(0)}%)`,
          },
          unit_amount: Math.round(estimatedTax * 100),
        },
        quantity: 1,
      });
    }

    // 5. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      customer_email: validatedData.email,
      metadata: {
        user_id: user?.id || "",
        shipping_fullName: validatedData.fullName || "",
        shipping_email: validatedData.email || "",
        shipping_phone: validatedData.phone || "",
        shipping_addressLine1: validatedData.addressLine1 || "",
        shipping_city: validatedData.city || "",
        shipping_postalCode: validatedData.postalCode || "",
        shipping_country: validatedData.country || "",
      },
    });

    if (!session.url) {
      return { success: false, error: "Failed to create checkout session URL." };
    }

    return { success: true, url: session.url };
  } catch (error: any) {
    console.error("Error creating Stripe checkout session:", error);
    return {
      success: false,
      error: error?.message || "Something went wrong creating checkout session.",
    };
  }
}
