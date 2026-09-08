import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyzeRouter from "./analyze";
import authRouter from "./auth";
import mcaRouter from "./mca";
import creditsRouter from "./credits";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(analyzeRouter);
router.use(mcaRouter);
router.use(creditsRouter);
router.use(stripeRouter);

export default router;
