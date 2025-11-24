import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = params;

    // Verify ownership
    const job = await db.query.jobApplications.findFirst({
      where: eq(jobApplications.id, id),
    });

    if (!job || job.userId !== session.user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Update job
    await db
      .update(jobApplications)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(jobApplications.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership
    const job = await db.query.jobApplications.findFirst({
      where: eq(jobApplications.id, id),
    });

    if (!job || job.userId !== session.user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Delete job (cascade will delete related answers)
    await db.delete(jobApplications).where(eq(jobApplications.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

