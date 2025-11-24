import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PricingCard from "@/components/pricing/pricing-card";

export default async function PricingPage() {
  const session = await auth();

  const plans = [
    {
      name: "Monthly",
      price: "$15",
      period: "/month",
      description: "Perfect for active job seekers",
      features: [
        "Unlimited resume generations",
        "Unlimited cover letters",
        "Job tracker",
        "Auto-apply packs",
        "Application answer generator",
        "PDF export",
        "Email support",
      ],
      priceId: process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly",
    },
    {
      name: "Yearly",
      price: "$79",
      period: "/year",
      description: "Best value - Save $101 per year",
      features: [
        "Everything in Monthly",
        "Priority support",
        "Early access to new features",
        "Advanced analytics",
        "2 months free",
      ],
      priceId: process.env.STRIPE_YEARLY_PRICE_ID || "price_yearly",
      popular: true,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">JobWise AI</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            {session ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground">
            Start with a 7-day free trial. No credit card required.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} session={session} />
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include a 7-day free trial. Cancel anytime.</p>
        </div>
      </section>
    </div>
  );
}

