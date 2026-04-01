import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, organizationsTable, storesTable, recipesTable } from "@workspace/db";
import {
  CreateOrganizationBody,
  DeleteOrganizationParams,
  ListOrganizationsResponse,
  CreateStoreParams,
  CreateStoreBody,
  DeleteStoreParams,
  ListStoresParams,
  ListStoresResponse,
  ListCompanyRecipesParams,
  ListCompanyRecipesResponse,
  CreateCompanyRecipeParams,
  CreateCompanyRecipeBody,
  DeleteCompanyRecipeParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/organizations", async (req, res): Promise<void> => {
  const orgs = await db.select().from(organizationsTable).orderBy(organizationsTable.name);
  res.json(ListOrganizationsResponse.parse(orgs));
});

router.post("/organizations", async (req, res): Promise<void> => {
  const parsed = CreateOrganizationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [org] = await db.insert(organizationsTable).values(parsed.data).returning();
  res.status(201).json(org);
});

router.delete("/organizations/:id", async (req, res): Promise<void> => {
  const params = DeleteOrganizationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [org] = await db
    .delete(organizationsTable)
    .where(eq(organizationsTable.id, params.data.id))
    .returning();
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/organizations/:id/stores", async (req, res): Promise<void> => {
  const params = ListStoresParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const stores = await db
    .select()
    .from(storesTable)
    .where(eq(storesTable.organizationId, params.data.id))
    .orderBy(storesTable.name);
  res.json(ListStoresResponse.parse(stores));
});

router.post("/organizations/:id/stores", async (req, res): Promise<void> => {
  const params = CreateStoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateStoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [store] = await db
    .insert(storesTable)
    .values({ ...parsed.data, organizationId: params.data.id })
    .returning();
  res.status(201).json(store);
});

router.delete("/stores/:id", async (req, res): Promise<void> => {
  const params = DeleteStoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [store] = await db
    .delete(storesTable)
    .where(eq(storesTable.id, params.data.id))
    .returning();
  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/organizations/:id/recipes", async (req, res): Promise<void> => {
  const params = ListCompanyRecipesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const recipes = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.organizationId, params.data.id))
    .orderBy(recipesTable.menuItem);
  const result = recipes.map((r) => ({ ...r, isCompanyRecipe: true }));
  res.json(ListCompanyRecipesResponse.parse(result));
});

router.post("/organizations/:id/recipes", async (req, res): Promise<void> => {
  const params = CreateCompanyRecipeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateCompanyRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [recipe] = await db
    .insert(recipesTable)
    .values({ ...parsed.data, organizationId: params.data.id, storeId: null })
    .returning();
  res.status(201).json({ ...recipe, isCompanyRecipe: true });
});

router.delete("/organizations/:id/recipes/:recipeId", async (req, res): Promise<void> => {
  const params = DeleteCompanyRecipeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [recipe] = await db
    .delete(recipesTable)
    .where(eq(recipesTable.id, params.data.recipeId))
    .returning();
  if (!recipe) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
