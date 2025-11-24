import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { resumes } from "@/db/schema";
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
    const resume = await db.query.resumes.findFirst({
      where: eq(resumes.id, id),
    });

    if (!resume || resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Update resume
    await db
      .update(resumes)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

