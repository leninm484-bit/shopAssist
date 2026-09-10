import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shopassistRouter from "./shopassist";

const router: IRouter = Router();

router.use(healthRouter);
router.use(shopassistRouter);

export default router;
