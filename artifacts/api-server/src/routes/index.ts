import { Router, type IRouter } from "express";
import healthRouter from "./health";
import organizationsRouter from "./organizations";
import inventoryRouter from "./inventory";
import salesRouter from "./sales";
import recipesRouter from "./recipes";
import recommendationsRouter from "./recommendations";
import predictionsRouter from "./predictions";
import analyticsRouter from "./analytics";
import wasteRouter from "./waste";
import foodCostRouter from "./food-cost";
import pdfImportRouter from "./pdf-import";

const router: IRouter = Router();

router.use(healthRouter);
router.use(organizationsRouter);
router.use(inventoryRouter);
router.use(salesRouter);
router.use(recipesRouter);
router.use(recommendationsRouter);
router.use(predictionsRouter);
router.use(analyticsRouter);
router.use(wasteRouter);
router.use(foodCostRouter);
router.use(pdfImportRouter);

export default router;
