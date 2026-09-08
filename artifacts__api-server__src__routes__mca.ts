import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, usersTable } from "@workspace/db";
import { and, gte, sql, eq } from "drizzle-orm";

const mcaRouter = Router();

mcaRouter.post("/mca", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { jobDescription, resumes } = req.body as {
    jobDescription?: string;
    resumes?: string[];
  };

  if (!jobDescription || jobDescription.trim().length < 30) {
    res.status(400).json({ error: "Please provide a job description (at least 30 characters)." });
    return;
  }

  if (!resumes || !Array.isArray(resumes) || resumes.length < 2) {
    res.status(400).json({ error: "Please provide at least 2 candidate resumes to compare." });
    return;
  }

  if (resumes.length > 999) {
    res.status(400).json({ error: "Maximum 999 candidates per analysis." });
    return;
  }

  const validResumes = resumes.filter((r) => r && r.trim().length >= 50);
  if (validResumes.length < 2) {
    res.status(400).json({ error: "At least 2 resumes must have meaningful content (50+ characters each)." });
    return;
  }

  const creditsNeeded = validResumes.length;
  const userId = (req.user as { id: string }).id;

  // Atomic deduct: only succeeds if credits >= creditsNeeded, eliminates race condition
  const [updated] = await db
    .update(usersTable)
    .set({ credits: sql`${usersTable.credits} - ${creditsNeeded}` })
    .where(and(eq(usersTable.id, userId), gte(usersTable.credits, creditsNeeded)))
    .returning({ credits: usersTable.credits });

  if (!updated) {
    const [user] = await db.select({ credits: usersTable.credits }).from(usersTable).where(eq(usersTable.id, userId));
    res.status(402).json({
      error: `Insufficient credits. This analysis requires ${creditsNeeded} credit${creditsNeeded !== 1 ? "s" : ""} (1 per resume). You have ${user?.credits ?? 0}.`,
    });
    return;
  }

  const numberedResumes = validResumes
    .map((resume, i) => `--- CANDIDATE ${i + 1} ---\n${resume.trim()}`)
    .join("\n\n");

  const systemPrompt = `You are a world-class recruiter and HR expert. You evaluate multiple candidates against a job description and rank them by fit. Always respond with valid JSON only — no markdown, no explanation outside the JSON.`;

  const userPrompt = `Evaluate the following ${validResumes.length} candidate resumes against the job description below. Rank ALL candidates by their fit for the role and return a JSON object.

Return this exact JSON structure:
{
  "rankings": [
    {
      "rank": 1,
      "candidateIndex": <0-based index matching the candidate order>,
      "candidateLabel": "Candidate N",
      "candidateName": "<full name extracted from the resume, or null if not found>",
      "fitScore": <number 0-100, representing overall fit percentage>,
      "recommendation": "<one of: Strong Hire | Hire | Maybe | No Hire>",
      "summary": "<2-sentence executive summary of this candidate for this role>",
      "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
      "mainGap": "<single most important concern or gap>",
      "yearsExperience": <estimated number>,
      "seniorityLevel": "<Junior | Mid-level | Senior | Lead | Executive>"
    }
    ... (include ALL ${validResumes.length} candidates, ranked 1 to ${validResumes.length}, but return only the top ${Math.min(10, validResumes.length)} if there are more than 10)
  ],
  "totalCandidates": ${validResumes.length},
  "roleTitle": "<infer the role title from the job description>"
}

JOB DESCRIPTION:
${jobDescription}

CANDIDATES:
${numberedResumes}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 16000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";

    let result: unknown;
    try {
      result = JSON.parse(content);
    } catch {
      req.log.error({ content }, "Failed to parse MCA AI response as JSON");
      await db
        .update(usersTable)
        .set({ credits: sql`${usersTable.credits} + ${creditsNeeded}` })
        .where(eq(usersTable.id, userId));
      res.status(500).json({ error: "Failed to parse analysis results. Please try again." });
      return;
    }

    res.json({ ...(result as object), creditsRemaining: updated.credits });
  } catch (err) {
    req.log.error({ err }, "OpenAI MCA error");
    await db
      .update(usersTable)
      .set({ credits: sql`${usersTable.credits} + ${creditsNeeded}` })
      .where(eq(usersTable.id, userId));
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default mcaRouter;
