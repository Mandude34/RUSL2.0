import { Router, type IRouter } from "express";
import { eq, or, isNull, and } from "drizzle-orm";
import { db, recipesTable } from "@workspace/db";
import {
  CreateRecipeBody,
  DeleteRecipeParams,
  ListRecipesResponse,
  ListRecipesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recipes", async (req, res): Promise<void> => {
  const query = ListRecipesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { storeId, organizationId } = query.data;

  let whereClause;
  if (storeId != null && organizationId != null) {
    whereClause = or(
      eq(recipesTable.storeId, storeId),
      eq(recipesTable.organizationId, organizationId)
    );
  } else if (storeId != null) {
    whereClause = eq(recipesTable.storeId, storeId);
  } else if (organizationId != null) {
    whereClause = eq(recipesTable.organizationId, organizationId);
  } else {
    whereClause = and(isNull(recipesTable.storeId), isNull(recipesTable.organizationId));
  }

  const recipes = await db
    .select()
    .from(recipesTable)
    .where(whereClause)
    .orderBy(recipesTable.menuItem);

  const result = recipes.map((r) => ({
    ...r,
    isCompanyRecipe: r.organizationId != null,
  }));
  res.json(ListRecipesResponse.parse(result));
});

router.post("/recipes", async (req, res): Promise<void> => {
  const parsed = CreateRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [recipe] = await db.insert(recipesTable).values(parsed.data).returning();
  res.status(201).json({ ...recipe, isCompanyRecipe: recipe.organizationId != null });
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
