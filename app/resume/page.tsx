import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ResumeUpload from "@/components/resume/resume-upload";

export default async function ResumePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  const resumeList = await db.query.resumes.findMany({
    where: eq(resumes.userId, userId),
    orderBy: (resumes, { desc }) => [desc(resumes.createdAt)],
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Resumes</h1>
            <p className="text-muted-foreground">Create and manage your AI-powered resumes</p>
          </div>
          <ResumeUpload />
        </div>

        {resumeList.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <CardTitle className="mb-2">No resumes yet</CardTitle>
            <CardDescription className="mb-4">
              Upload your first resume to get started with AI-powered resume generation
            </CardDescription>
            <ResumeUpload />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumeList.map((resume) => (
              <Link key={resume.id} href={`/resume/${resume.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Resume</span>
                    </CardTitle>
                    <CardDescription>
                      Created {new Date(resume.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Style: </span>
                        {resume.style || "Not set"}
                      </div>
                      {resume.finalText && (
                        <Badge variant="secondary">Generated</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

