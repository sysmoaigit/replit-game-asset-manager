import { Router, type IRouter } from "express";
import healthRouter from "./health";
import selimChatRouter from "./selimChat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(selimChatRouter);

export default router;
