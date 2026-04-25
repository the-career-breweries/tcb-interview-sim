export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { jobTitle, company, jobDescription, resumeText } = req.body;
  if (!jobTitle || !jobDescription) return res.status(400).json({ error: "Job title and description required" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const resumeContext = resumeText
    ? `\nCANDIDATE RESUME:\n${resumeText}\n`
    : "\nNo resume provided — generate questions based on the role and JD only.\n";

  const prompt = `You are an experienced senior interviewer preparing a realistic, calibrated interview simulation.

ROLE: ${jobTitle}
COMPANY: ${company || "the company"}
JOB DESCRIPTION: ${jobDescription}
${resumeContext}

Generate exactly 8 interview questions that a real interviewer would ask for this role. Vary the types:
- 2 behavioural questions (STAR-method, "Tell me about a time…")
- 2 role-specific technical or functional questions
- 2 situational questions ("How would you handle…")
- 1 motivation/culture question ("Why this role / company")
- 1 closing question ("Where do you see yourself…" or "What questions do you have")

If a resume is provided, make 2–3 questions specific to something in their background.
Keep questions sharp, realistic, and specific to this role — not generic.

Respond ONLY with a valid JSON array:
[
  {
    "id": 1,
    "type": "behavioural",
    "question": "Tell me about a time you had to...",
    "hint": "They're looking for: specific situation, your action, and the result",
    "difficulty": "medium"
  }
]
Types: "behavioural" | "technical" | "situational" | "motivation" | "closing"
Difficulty: "easy" | "medium" | "hard"`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: "Generation failed" });

    const raw = (data?.content?.[0]?.text || "").trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(clean);
    return res.status(200).json({ success: true, questions });
  } catch (err) {
    console.error("Generate questions error:", err);
    return res.status(500).json({ error: "Failed to generate questions. Please try again." });
  }
}
