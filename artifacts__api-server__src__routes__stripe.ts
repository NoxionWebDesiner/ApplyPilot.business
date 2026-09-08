import { Router } from "express";
import { getUncachableStripeClient } from "../stripeClient";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const stripeRouter = Router();

stripeRouter.post("/stripe/checkout", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { credits } = req.body as { credits?: number };
  if (!credits || credits < 1) {
    res.status(400).json({ error: "Invalid credits amount." });
    return;
  }

  const stripe = await getUncachableStripeClient();

  const prices = await stripe.prices.list({ active: true, expand: ["data.product"], limit: 100 });
  const match = prices.data.find((p) => {
    const prod = p.product as { metadata?: Record<string, string> };
    return prod?.metadata?.credits === String(credits);
  });

  if (!match) {
    res.status(404).json({ error: "No price found for that pack." });
    return;
  }

  const userId = (req.user as { id: string }).id;
  const [user] = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, userId));

  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  const baseUrl = domain ? `https://${domain}` : "http://localhost:80";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{ price: match.id, quantity: 1 }],
    customer_email: user?.email ?? undefined,
    metadata: { userId, credits: String(credits) },
    success_url: `${baseUrl}/packs?success=1&credits=${credits}`,
    cancel_url: `${baseUrl}/packs`,
  });

  res.json({ url: session.url });
});

export default stripeRouter;
