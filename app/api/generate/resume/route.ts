import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, style = "ats-optimized" } = await request.json();

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }

    // Get resume
    const resume = await db.query.resumes.findFirst({
      where: eq(resumes.id, resumeId),
    });

    if (!resume || resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Create OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Generate resume
    const stylePrompts = {
      "ats-optimized":
        "Create an ATS-optimized resume with keywords, quantified achievements, and clear section headers.",
      modern: "Create a modern, visually appealing resume with a creative layout and design.",
      traditional: "Create a traditional, conservative resume suitable for formal industries.",
      minimal: "Create a minimal, clean resume with essential information only.",
      creative: "Create a creative, unique resume that stands out while remaining professional.",
    };

    const prompt = `You are an expert resume writer. Generate a professional resume based on the following raw text. 

Style: ${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts["ats-optimized"]}

Raw resume text:
${resume.rawText || ""}

Generate a complete resume with:
1. Professional Summary (3-4 sentences)
2. Skills Section (organized by category)
3. Work Experience (with quantified bullet points)
4. Education
5. Achievements/Certifications (if applicable)

Format the output as a well-structured resume that can be displayed in HTML. Use clear sections and professional language.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const generatedResume = completion.choices[0].message.content || "";

    // Update resume
    await db
      .update(resumes)
      .set({
        finalText: generatedResume,
        style,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, resumeId));

    return NextResponse.json({
      success: true,
      resume: {
        id: resumeId,
        finalText: generatedResume,
        style,
      },
    });
  } catch (error) {
    console.error("Generate resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

