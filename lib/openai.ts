import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateResume({
  rawText,
  style = "ats-optimized",
}: {
  rawText: string;
  style?: string;
}) {
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
${rawText}

Generate a complete resume with:
1. Professional Summary (3-4 sentences)
2. Skills Section (organized by category)
3. Work Experience (with quantified bullet points)
4. Education
5. Achievements/Certifications (if applicable)

Format the output as a well-structured resume that can be displayed in HTML. Use clear sections and professional language.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content || "";
}

export async function generateCoverLetter({
  jobTitle,
  company,
  jobDescription,
  resumeData,
  tone = "formal",
}: {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resumeData: string;
  tone?: string;
}) {
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
${jobDescription}

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

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
  });

  return completion.choices[0].message.content || "";
}

export async function generateApplicationAnswers({
  question,
  jobDescription,
  resumeData,
  answerType = "star",
}: {
  question: string;
  jobDescription: string;
  resumeData: string;
  answerType?: string;
}) {
  const typePrompts = {
    short: "Provide a brief 2-3 sentence answer",
    long: "Provide a detailed paragraph answer",
    star: "Use the STAR method (Situation, Task, Action, Result) with a specific example",
  };

  const prompt = `Answer the following application question:

Question: ${question}

Job Description:
${jobDescription}

Applicant's Resume:
${resumeData}

Answer Format: ${typePrompts[answerType as keyof typeof typePrompts] || typePrompts.star}

Generate a professional, relevant answer that demonstrates the applicant's qualifications and experience.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content || "";
}

export async function parseResumeText(text: string) {
  const prompt = `Parse the following resume text and extract structured information. Return a JSON object with the following structure:

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
${text}

Return only the JSON object, no additional text.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  try {
    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch {
    return {
      workExperience: [],
      skills: [],
      education: [],
      achievements: [],
      keywords: [],
    };
  }
}

