export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question, answer, jobTitle, company, questionType } = req.body;
  if (!question || !answer) return res.status(400).json({ error: "Question and answer required" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const prompt = `You are a senior interviewer giving honest, constructive feedback on a candidate's answer.

Role: ${jobTitle} at ${company || "the company"}
Question type: ${questionType}
Question: "${question}"
Candidate's answer: "${answer}"

Evaluate the answer and provide feedback. Be direct but encouraging. Don't be generic.

Respond ONLY with valid JSON:
{
  "score": 7,
  "verdict": "one-line verdict (e.g. 'Strong answer with a clear result' or 'Too vague — needs a specific example')",
  "what_worked": "one or two things they did well (be specific)",
  "improve": "one concrete thing to sharpen — specific, actionable",
  "stronger_angle": "a brief suggestion of what a stronger answer would lead with"
}
Score: 1–10. Be honest — a 10 is rare, 6–7 is solid, below 5 means real work needed.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: "Feedback failed" });

    const raw = (data?.content?.[0]?.text || "").trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const feedback = JSON.parse(clean);
    return res.status(200).json({ success: true, feedback });
  } catch (err) {
    console.error("Feedback error:", err);
    return res.status(500).json({ error: "Feedback failed. Please try again." });
  }
}
