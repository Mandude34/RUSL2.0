import { Router, type IRouter } from "express";
import healthRouter from "./health";
import organizationsRouter from "./organizations";
import inventoryRouter from "./inventory";
import salesRouter from "./sales";
import recipesRouter from "./recipes";
import recommendationsRouter from "./recommendations";
import predictionsRouter from "./predictions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(organizationsRouter);
router.use(inventoryRouter);
router.use(salesRouter);
router.use(recipesRouter);
router.use(recommendationsRouter);
router.use(predictionsRouter);

export default router;
