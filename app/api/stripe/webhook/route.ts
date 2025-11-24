import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
          // Update user subscription
          await db
            .update(users)
            .set({
              subscriptionStatus: "active",
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              subscriptionEndsAt: null,
            })
            .where(eq(users.id, userId));
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user by subscription ID
        const allUsers = await db.query.users.findMany();
        const user = allUsers.find((u) => u.stripeSubscriptionId === subscription.id);

        if (user) {
          if (subscription.status === "active") {
            await db
              .update(users)
              .set({
                subscriptionStatus: "active",
                subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
              })
              .where(eq(users.id, user.id));
          } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
            await db
              .update(users)
              .set({
                subscriptionStatus: "cancelled",
                subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
              })
              .where(eq(users.id, user.id));
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

