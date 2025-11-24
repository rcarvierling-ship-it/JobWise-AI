import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { applicationAnswers, resumes, jobApplications } from "@/db/schema";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      applicationId,
      question,
      answerType = "star",
      resumeId,
    } = await request.json();

    if (!applicationId || !question) {
      return NextResponse.json(
        { error: "Application ID and question are required" },
        { status: 400 }
      );
    }

    // Get application
    const application = await db.query.jobApplications.findFirst({
      where: eq(jobApplications.id, applicationId),
    });

    if (!application || application.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
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

    // Generate answer
    const typePrompts = {
      short: "Provide a brief 2-3 sentence answer",
      long: "Provide a detailed paragraph answer",
      star: "Use the STAR method (Situation, Task, Action, Result) with a specific example",
    };

    const prompt = `Answer the following application question:

Question: ${question}

Job Description:
${application.jobDescription || ""}

Applicant's Resume:
${resumeData}

Answer Format: ${typePrompts[answerType as keyof typeof typePrompts] || typePrompts.star}

Generate a professional, relevant answer that demonstrates the applicant's qualifications and experience.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const answer = completion.choices[0].message.content || "";

    // Save answer
    const answerId = generateId();
    await db.insert(applicationAnswers).values({
      id: answerId,
      applicationId,
      question,
      answer,
      answerType,
    });

    return NextResponse.json({
      success: true,
      answer: {
        id: answerId,
        question,
        answer,
        answerType,
      },
    });
  } catch (error) {
    console.error("Generate application answer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

