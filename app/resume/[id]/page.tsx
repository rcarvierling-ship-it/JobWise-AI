import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardLayout } from "@/components/dashboard/layout";
import ResumeBuilder from "@/components/resume/resume-builder";

export default async function ResumeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const resume = await db.query.resumes.findFirst({
    where: eq(resumes.id, params.id),
  });

  if (!resume || resume.userId !== session.user.id) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <ResumeBuilder resume={resume} />
      </div>
    </DashboardLayout>
  );
}

