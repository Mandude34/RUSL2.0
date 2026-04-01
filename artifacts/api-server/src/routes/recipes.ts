import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, recipesTable } from "@workspace/db";
import {
  CreateRecipeBody,
  DeleteRecipeParams,
  ListRecipesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recipes", async (req, res): Promise<void> => {
  const recipes = await db.select().from(recipesTable).orderBy(recipesTable.menuItem);
  res.json(ListRecipesResponse.parse(recipes));
});

router.post("/recipes", async (req, res): Promise<void> => {
  const parsed = CreateRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [recipe] = await db.insert(recipesTable).values(parsed.data).returning();
  res.status(201).json(recipe);
});

router.delete("/recipes/:id", async (req, res): Promise<void> => {
  const params = DeleteRecipeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [recipe] = await db
    .delete(recipesTable)
    .where(eq(recipesTable.id, params.data.id))
    .returning();
  if (!recipe) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
