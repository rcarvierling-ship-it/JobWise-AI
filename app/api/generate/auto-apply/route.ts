import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { autoApplyPacks } from "@/db/schema";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { resumes } from "@/db/schema";
import OpenAI from "openai";

// Simplified job scraping - in production, use a proper scraping service
async function scrapeJobDescription(url: string): Promise<{
  title: string;
  company: string;
  description: string;
} | null> {
  try {
    // This is a simplified version - in production, use a proper scraping service
    // For now, we'll return a placeholder
    return {
      title: "Software Engineer",
      company: "Company Name",
      description: "Job description will be extracted from the URL",
    };
  } catch (error) {
    console.error("Error scraping job:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "URLs array is required" },
        { status: 400 }
      );
    }

    // Get user's latest resume
    const userResume = await db.query.resumes.findFirst({
      where: eq(resumes.userId, session.user.id),
      orderBy: (resumes, { desc }) => [desc(resumes.createdAt)],
    });

    const resumeData = userResume?.finalText || userResume?.rawText || "";

    if (!resumeData) {
      return NextResponse.json(
        { error: "Please upload a resume first" },
        { status: 400 }
      );
    }

    // Create OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const outputs: Record<string, any> = {};

    // Process each URL
    for (const url of urls) {
      try {
        // Scrape job description
        const jobInfo = await scrapeJobDescription(url);

        if (!jobInfo) {
          outputs[url] = { error: "Failed to scrape job description" };
          continue;
        }

        // Generate resume for this job
        const stylePrompts = {
          "ats-optimized":
            "Create an ATS-optimized resume with keywords, quantified achievements, and clear section headers.",
        };

        const resumePrompt = `You are an expert resume writer. Generate a professional resume based on the following raw text. 

Style: ${stylePrompts["ats-optimized"]}

Raw resume text:
${resumeData}

Generate a complete resume with:
1. Professional Summary (3-4 sentences)
2. Skills Section (organized by category)
3. Work Experience (with quantified bullet points)
4. Education
5. Achievements/Certifications (if applicable)

Format the output as a well-structured resume that can be displayed in HTML. Use clear sections and professional language.`;

        const resumeCompletion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: resumePrompt }],
          temperature: 0.7,
        });

        const resume = resumeCompletion.choices[0].message.content || "";

        // Generate cover letter
        const coverLetterPrompt = `Write a personalized cover letter for the following position:

Job Title: ${jobInfo.title}
Company: ${jobInfo.company}

Job Description:
${jobInfo.description}

Applicant's Resume Summary:
${resumeData}

Tone: Use a formal, professional tone

Write a compelling cover letter that:
1. Addresses the hiring manager (use "Dear Hiring Manager" if no name is provided)
2. Highlights relevant experience from the resume
3. Shows understanding of the role and company
4. Demonstrates enthusiasm and fit
5. Includes a clear call to action

Keep it between 3-4 paragraphs.`;

        const coverLetterCompletion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: coverLetterPrompt }],
          temperature: 0.8,
        });

        const coverLetter = coverLetterCompletion.choices[0].message.content || "";

        // Generate common application answers
        const commonQuestions = [
          "Why do you want this job?",
          "Tell us about a challenge you overcame",
          "Describe your experience with the required technologies",
        ];

        const typePrompts = {
          star: "Use the STAR method (Situation, Task, Action, Result) with a specific example",
        };

        const answers = await Promise.all(
          commonQuestions.map((question) => {
            const answerPrompt = `Answer the following application question:

Question: ${question}

Job Description:
${jobInfo.description}

Applicant's Resume:
${resumeData}

Answer Format: ${typePrompts.star}

Generate a professional, relevant answer that demonstrates the applicant's qualifications and experience.`;

            return client.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: answerPrompt }],
              temperature: 0.7,
            });
          })
        );

        const answerTexts = answers.map(
          (a) => a.choices[0].message.content || ""
        );

        outputs[url] = {
          jobTitle: jobInfo.title,
          company: jobInfo.company,
          jobDescription: jobInfo.description,
          resume,
          coverLetter,
          answers: commonQuestions.map((q, i) => ({
            question: q,
            answer: answerTexts[i],
          })),
        };
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
        outputs[url] = { error: "Failed to process this URL" };
      }
    }

    // Save to database
    const packId = generateId();
    await db.insert(autoApplyPacks).values({
      id: packId,
      userId: session.user.id,
      inputUrls: urls,
      generatedOutputs: outputs,
    });

    return NextResponse.json({
      success: true,
      packId,
      outputs,
    });
  } catch (error) {
    console.error("Auto-apply error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

