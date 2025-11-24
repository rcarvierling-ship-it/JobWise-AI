"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PricingCard({
  plan,
  session,
}: {
  plan: {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    priceId: string;
    popular?: boolean;
  };
  session: any;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!session) {
      router.push("/auth/signup");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={plan.popular ? "border-primary border-2" : ""}>
      {plan.popular && (
        <div className="flex justify-center pt-4">
          <Badge className="bg-primary">Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-muted-foreground">{plan.period}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          variant={plan.popular ? "default" : "outline"}
          onClick={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : session ? "Subscribe" : "Start Free Trial"}
        </Button>
      </CardContent>
    </Card>
  );
}

