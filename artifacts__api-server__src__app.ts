import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";
import { getUncachableStripeClient } from "./stripeClient";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const app: Express = express();

// Stripe webhook MUST be registered before express.json() so body is raw Buffer.
// This is the single authoritative webhook handler — it verifies the signature
// and assigns credits on checkout.session.completed.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      res.status(400).json({ error: "Missing stripe-signature" });
      return;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error("STRIPE_WEBHOOK_SECRET is not set — cannot verify webhook");
      res.status(500).json({ error: "Webhook secret not configured" });
      return;
    }

    let event;
    try {
      const stripe = await getUncachableStripeClient();
      const sig = Array.isArray(signature) ? signature[0] : signature;
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch (err) {
      logger.error({ err }, "Stripe webhook signature verification failed");
      res.status(400).json({ error: "Webhook signature verification failed" });
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits ?? "0", 10);
      if (userId && credits > 0) {
        await db
          .update(usersTable)
          .set({ credits: sql`${usersTable.credits} + ${credits}` })
          .where(eq(usersTable.id, userId));
        logger.info({ userId, credits }, "Credits added after successful payment");
      }
    }

    res.status(200).json({ received: true });
  }
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

export default app;
