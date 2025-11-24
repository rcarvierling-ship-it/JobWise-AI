import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { coverLetters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardLayout } from "@/components/dashboard/layout";
import CoverLetterViewer from "@/components/cover-letter/cover-letter-viewer";

export default async function CoverLetterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const coverLetter = await db.query.coverLetters.findFirst({
    where: eq(coverLetters.id, params.id),
  });

  if (!coverLetter || coverLetter.userId !== session.user.id) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <CoverLetterViewer coverLetter={coverLetter} />
      </div>
    </DashboardLayout>
  );
}

