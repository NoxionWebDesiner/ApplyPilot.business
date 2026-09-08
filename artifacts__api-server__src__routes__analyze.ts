import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, usersTable } from "@workspace/db";
import { and, gte, sql, eq } from "drizzle-orm";

const analyzeRouter = Router();

analyzeRouter.post("/analyze", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { resumeText, jobDescription } = req.body as {
    resumeText?: string;
    jobDescription?: string;
  };

  if (!resumeText || resumeText.trim().length < 50) {
    res.status(400).json({ error: "Please provide a resume with at least 50 characters." });
    return;
  }

  const userId = (req.user as { id: string }).id;

  // Atomic deduct: only succeeds if credits >= 1, eliminates race condition
  const [updated] = await db
    .update(usersTable)
    .set({ credits: sql`${usersTable.credits} - 1` })
    .where(and(eq(usersTable.id, userId), gte(usersTable.credits, 1)))
    .returning({ credits: usersTable.credits });

  if (!updated) {
    res.status(402).json({ error: "Insufficient credits. Please purchase more credits to continue." });
    return;
  }

  const systemPrompt = `You are an expert recruiter and HR professional. Analyze the provided resume and return a structured JSON candidate report. Be precise, objective, and actionable. Always respond with valid JSON only — no markdown, no explanation outside the JSON.`;

  const userPrompt = `Analyze this candidate's resume${jobDescription ? " against the provided job description" : ""} and return a JSON report with this exact structure:

{
  "overallScore": <number 0-100>,
  "recommendation": "<one of: Strong Hire | Hire | Maybe | No Hire>",
  "summary": "<2-3 sentence executive summary of the candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "skills": {
    "technical": ["<skill>", ...],
    "soft": ["<skill>", ...]
  },
  "experience": {
    "yearsEstimate": <number>,
    "seniorityLevel": "<one of: Junior | Mid-level | Senior | Lead | Executive>",
    "highlights": ["<highlight 1>", "<highlight 2>"]
  },
  "interviewQuestions": ["<question 1>", "<question 2>", "<question 3>"]${jobDescription ? ',\n  "fitScore": <number 0-100 specifically for this role>' : ""}
}

RESUME:
${resumeText}${jobDescription ? `\n\nJOB DESCRIPTION:\n${jobDescription}` : ""}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";

    let analysis: unknown;
    try {
      analysis = JSON.parse(content);
    } catch {
      req.log.error({ content }, "Failed to parse AI response as JSON");
      await db
        .update(usersTable)
        .set({ credits: sql`${usersTable.credits} + 1` })
        .where(eq(usersTable.id, userId));
      res.status(500).json({ error: "Failed to parse analysis. Please try again." });
      return;
    }

    res.json({ analysis, creditsRemaining: updated.credits });
  } catch (err) {
    req.log.error({ err }, "OpenAI analyze error");
    await db
      .update(usersTable)
      .set({ credits: sql`${usersTable.credits} + 1` })
      .where(eq(usersTable.id, userId));
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default analyzeRouter;
