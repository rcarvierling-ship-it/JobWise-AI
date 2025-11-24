import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications, resumes, coverLetters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, FileText, Send, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  // Get stats
  const [jobs, resumeList, coverLetterList] = await Promise.all([
    db.query.jobApplications.findMany({
      where: eq(jobApplications.userId, userId),
      limit: 5,
      orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
    }),
    db.query.resumes.findMany({
      where: eq(resumes.userId, userId),
      limit: 5,
      orderBy: (resumes, { desc }) => [desc(resumes.createdAt)],
    }),
    db.query.coverLetters.findMany({
      where: eq(coverLetters.userId, userId),
      limit: 5,
      orderBy: (coverLetters, { desc }) => [desc(coverLetters.createdAt)],
    }),
  ]);

  const stats = {
    totalJobs: jobs.length,
    appliedJobs: jobs.filter((j) => j.status === "applied").length,
    interviews: jobs.filter((j) => j.status === "interview").length,
    offers: jobs.filter((j) => j.status === "offer").length,
    resumes: resumeList.length,
    coverLetters: coverLetterList.length,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appliedJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.interviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offers</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.offers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="flex gap-4">
            <Link href="/resume">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Resume
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Job
              </Button>
            </Link>
            <Link href="/cover-letter">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Generate Cover Letter
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Items */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Resumes</CardTitle>
                <Link href="/resume">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {resumeList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No resumes yet</p>
              ) : (
                <div className="space-y-2">
                  {resumeList.map((resume) => (
                    <Link
                      key={resume.id}
                      href={`/resume/${resume.id}`}
                      className="flex items-center space-x-2 rounded p-2 hover:bg-accent"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">
                        Resume {new Date(resume.createdAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Cover Letters</CardTitle>
                <Link href="/cover-letter">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {coverLetterList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cover letters yet</p>
              ) : (
                <div className="space-y-2">
                  {coverLetterList.map((letter) => (
                    <Link
                      key={letter.id}
                      href={`/cover-letter/${letter.id}`}
                      className="flex items-center space-x-2 rounded p-2 hover:bg-accent"
                    >
                      <Send className="h-4 w-4" />
                      <span className="text-sm">
                        {letter.jobTitle} at {letter.company}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

