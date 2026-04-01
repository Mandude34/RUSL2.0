import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inventoryRouter from "./inventory";
import salesRouter from "./sales";
import recipesRouter from "./recipes";
import recommendationsRouter from "./recommendations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(inventoryRouter);
router.use(salesRouter);
router.use(recipesRouter);
router.use(recommendationsRouter);

export default router;
