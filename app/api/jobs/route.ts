import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await db.query.jobApplications.findMany({
      where: eq(jobApplications.userId, session.user.id),
      orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobTitle, company, jobUrl, jobDescription, status = "saved" } =
      await request.json();

    if (!jobTitle || !company) {
      return NextResponse.json(
        { error: "Job title and company are required" },
        { status: 400 }
      );
    }

    const jobId = generateId();
    await db.insert(jobApplications).values({
      id: jobId,
      userId: session.user.id,
      jobTitle,
      company,
      jobUrl: jobUrl || null,
      jobDescription: jobDescription || null,
      status: status as any,
    });

    return NextResponse.json({
      success: true,
      job: {
        id: jobId,
        jobTitle,
        company,
        jobUrl,
        jobDescription,
        status,
      },
    });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

