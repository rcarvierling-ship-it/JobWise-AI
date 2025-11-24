import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { coverLetters, resumes } from "@/db/schema";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobTitle, company, jobDescription, tone = "formal", resumeId } =
      await request.json();

    if (!jobTitle || !company) {
      return NextResponse.json(
        { error: "Job title and company are required" },
        { status: 400 }
      );
    }

    // Get resume data
    let resumeData = "";
    if (resumeId) {
      const resume = await db.query.resumes.findFirst({
        where: eq(resumes.id, resumeId),
      });
      if (resume) {
        resumeData = resume.finalText || resume.rawText || "";
      }
    }

    // Create OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Generate cover letter
    const tonePrompts = {
      formal: "Use a formal, professional tone",
      friendly: "Use a warm, friendly but professional tone",
      concise: "Keep it brief and to the point",
      confident: "Show confidence and enthusiasm",
    };

    const prompt = `Write a personalized cover letter for the following position:

Job Title: ${jobTitle}
Company: ${company}

Job Description:
${jobDescription || ""}

Applicant's Resume Summary:
${resumeData}

Tone: ${tonePrompts[tone as keyof typeof tonePrompts] || tonePrompts.formal}

Write a compelling cover letter that:
1. Addresses the hiring manager (use "Dear Hiring Manager" if no name is provided)
2. Highlights relevant experience from the resume
3. Shows understanding of the role and company
4. Demonstrates enthusiasm and fit
5. Includes a clear call to action

Keep it between 3-4 paragraphs.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const generatedCoverLetter = completion.choices[0].message.content || "";

    // Save cover letter
    const coverLetterId = generateId();
    await db.insert(coverLetters).values({
      id: coverLetterId,
      userId: session.user.id,
      jobTitle,
      company,
      jobDescription: jobDescription || null,
      outputText: generatedCoverLetter,
      tone,
    });

    return NextResponse.json({
      success: true,
      coverLetter: {
        id: coverLetterId,
        outputText: generatedCoverLetter,
        tone,
      },
    });
  } catch (error) {
    console.error("Generate cover letter error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

