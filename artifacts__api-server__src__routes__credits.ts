import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const creditsRouter = Router();

creditsRouter.get("/credits", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = (req.user as { id: string }).id;
  const [user] = await db
    .select({ credits: usersTable.credits })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  res.json({ credits: user?.credits ?? 0 });
});

export default creditsRouter;
