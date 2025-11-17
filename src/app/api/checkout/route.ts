import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { readCart } from "@/lib/cart";

export async function POST() {
  const cart = readCart();

  if (!cart.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY." },
      { status: 500 },
    );
  }

  try {
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ??
      headers().get("origin") ??
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/cart`,
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "DE", "AU"] },
      line_items: cart.map((item) =>
        item.priceId.startsWith("price_")
          ? {
              price: item.priceId,
              quantity: item.quantity,
            }
          : {
              price_data: {
                currency: item.currency,
                unit_amount: item.price,
                product_data: {
                  name: item.name,
                  images: item.imageUrl ? [item.imageUrl] : undefined,
                },
              },
              quantity: item.quantity,
            }
      ),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
