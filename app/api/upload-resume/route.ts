import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { generateId } from "@/lib/utils";
import OpenAI from "openai";

// This is a simplified version - in production, you'd integrate with UploadThing
// For now, we'll accept text directly or via file upload
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;

    if (!file && !text) {
      return NextResponse.json(
        { error: "File or text is required" },
        { status: 400 }
      );
    }

    let rawText = text || "";

    // If file is provided, extract text (simplified - in production use proper PDF/DOCX parsing)
    if (file) {
      // For now, we'll assume it's a text file or handle it on the client side
      // In production, use libraries like pdf-parse or mammoth for PDF/DOCX
      rawText = await file.text();
    }

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from file" },
        { status: 400 }
      );
    }

    // Create OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Parse resume with OpenAI
    const parsePrompt = `Parse the following resume text and extract structured information. Return a JSON object with the following structure:

{
  "workExperience": [
    {
      "company": "string",
      "title": "string",
      "duration": "string",
      "description": "string",
      "achievements": ["string"]
    }
  ],
  "skills": ["string"],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string"
    }
  ],
  "achievements": ["string"],
  "keywords": ["string"]
}

Resume text:
${rawText}

Return only the JSON object, no additional text.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: parsePrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    let parsedJson;
    try {
      parsedJson = JSON.parse(completion.choices[0].message.content || "{}");
    } catch {
      parsedJson = {
        workExperience: [],
        skills: [],
        education: [],
        achievements: [],
        keywords: [],
      };
    }

    // Save to database
    const resumeId = generateId();
    await db.insert(resumes).values({
      id: resumeId,
      userId: session.user.id,
      rawText,
      parsedJson,
      finalText: null,
    });

    return NextResponse.json({
      success: true,
      resume: {
        id: resumeId,
        rawText,
        parsedJson,
      },
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

