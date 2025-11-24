import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { coverLetters } from "@/db/schema";
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
    const coverLetter = await db.query.coverLetters.findFirst({
      where: eq(coverLetters.id, id),
    });

    if (!coverLetter || coverLetter.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Cover letter not found" },
        { status: 404 }
      );
    }

    // Update cover letter
    await db
      .update(coverLetters)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(coverLetters.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update cover letter error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

