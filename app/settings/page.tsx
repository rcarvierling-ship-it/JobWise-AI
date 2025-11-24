import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SettingsForm from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm user={session.user} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  {session.user.subscriptionStatus || "trial"}
                </p>
                {session.user.subscriptionEndsAt && (
                  <p className="text-sm">
                    <span className="font-medium">Ends:</span>{" "}
                    {new Date(session.user.subscriptionEndsAt).toLocaleDateString()}
                  </p>
                )}
                <div className="pt-4">
                  <a href="/pricing">
                    <Button variant="outline">Manage Subscription</Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

