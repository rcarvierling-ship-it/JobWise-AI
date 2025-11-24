import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkSubscription() {
  const session = await auth();
  if (!session?.user?.id) {
    return { subscribed: false, status: null };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return { subscribed: false, status: null };
  }

  // Check if subscription is active
  const now = new Date();
  const isActive =
    user.subscriptionStatus === "active" ||
    (user.subscriptionStatus === "trial" &&
      user.subscriptionEndsAt &&
      user.subscriptionEndsAt > now);

  return {
    subscribed: isActive,
    status: user.subscriptionStatus,
    endsAt: user.subscriptionEndsAt?.toISOString(),
  };
}

