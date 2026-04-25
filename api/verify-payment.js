import crypto from "crypto";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, phone, jobTitle, company, leadId } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: "Missing verification fields" });
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const sheetHook = process.env.GOOGLE_SHEET_WEBHOOK;
  const expected = crypto.createHmac("sha256", keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) return res.status(400).json({ error: "Payment verification failed" });
  try {
    if (leadId) {
      await fetch(`${supabaseUrl}/rest/v1/interview_sims?id=eq.${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` },
        body: JSON.stringify({ paid: true, payment_id: razorpay_payment_id, order_id: razorpay_order_id })
      });
    }
    if (resendKey) fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${resendKey}` }, body: JSON.stringify({ from: fromEmail, to: email, subject: "Your Interview Simulation — The Career Breweries", html: `<p>Payment confirmed. Return to the simulator to begin your session for ${jobTitle} at ${company}.</p><p>— The Career Breweries</p>` }) }).catch(() => {});
    if (sheetHook) fetch(sheetHook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "interview_sim_payment", email, phone, jobTitle, company, paymentId: razorpay_payment_id }) }).catch(() => {});
  } catch (e) { console.error(e); }
  return res.status(200).json({ success: true });
}
