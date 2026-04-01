import { Router, type IRouter } from "express";
import { eq, isNull, or, sql } from "drizzle-orm";
import { db, salesTable, recipesTable, inventoryTable, storesTable } from "@workspace/db";
import {
  CreateSaleBody,
  DeleteSaleParams,
  ListSalesResponse,
  ListSalesQueryParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

async function getRecipeForMenuItem(menuItem: string, storeId: number | null | undefined) {
  const nameLC = menuItem.toLowerCase();

  let orgId: number | null = null;
  if (storeId != null) {
    const [store] = await db.select().from(storesTable).where(eq(storesTable.id, storeId));
    orgId = store?.organizationId ?? null;
  }

  // Try store-specific recipe first, then company recipe
  const whereClause = storeId != null && orgId != null
    ? or(eq(recipesTable.storeId, storeId), eq(recipesTable.organizationId, orgId))
    : storeId != null
    ? eq(recipesTable.storeId, storeId)
    : orgId != null
    ? eq(recipesTable.organizationId, orgId)
    : isNull(recipesTable.storeId);

  const recipes = await db.select().from(recipesTable).where(whereClause);
  // Prefer store-specific recipe over company recipe
  const storeRecipe = recipes.find(
    (r) => r.menuItem.toLowerCase() === nameLC && r.storeId != null
  );
  const companyRecipe = recipes.find(
    (r) => r.menuItem.toLowerCase() === nameLC && r.organizationId != null
  );
  const fallback = recipes.find((r) => r.menuItem.toLowerCase() === nameLC);
  return storeRecipe ?? companyRecipe ?? fallback ?? null;
}

async function adjustInventory(
  menuItem: string,
  quantity: number,
  storeId: number | null | undefined,
  direction: "deduct" | "restore"
) {
  const recipe = await getRecipeForMenuItem(menuItem, storeId);
  if (!recipe) return;

  for (const ing of recipe.ingredients) {
    const ingNameLC = ing.ingredientName.toLowerCase();
    const amount = ing.amountPerServing * quantity;

    // Find matching inventory item
    const invItems = await db
      .select()
      .from(inventoryTable)
      .where(
        storeId != null
          ? eq(inventoryTable.storeId, storeId)
          : isNull(inventoryTable.storeId)
      );

    const inv = invItems.find((i) => i.name.toLowerCase() === ingNameLC);
    if (!inv) continue;

    const newStock =
      direction === "deduct"
        ? Math.max(0, inv.stock - amount)
        : inv.stock + amount;

    await db
      .update(inventoryTable)
      .set({ stock: newStock })
      .where(eq(inventoryTable.id, inv.id));

    logger.debug(
      { ingredient: ing.ingredientName, amount, direction, newStock },
      "Inventory adjusted"
    );
  }
}

router.get("/sales", async (req, res): Promise<void> => {
  const query = ListSalesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { storeId } = query.data;
  const sales = await db
    .select()
    .from(salesTable)
    .where(
      storeId != null
        ? eq(salesTable.storeId, storeId)
        : isNull(salesTable.storeId)
    )
    .orderBy(salesTable.createdAt);
  res.json(ListSalesResponse.parse(sales));
});

router.post("/sales", async (req, res): Promise<void> => {
  const parsed = CreateSaleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [sale] = await db.insert(salesTable).values(parsed.data).returning();

  // Auto-deduct inventory based on recipe
  await adjustInventory(sale.menuItem, sale.quantity, sale.storeId, "deduct");

  res.status(201).json(sale);
});

router.delete("/sales/:id", async (req, res): Promise<void> => {
  const params = DeleteSaleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Fetch the sale before deleting so we can restore inventory
  const [existing] = await db
    .select()
    .from(salesTable)
    .where(eq(salesTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Sale not found" });
    return;
  }

  await db.delete(salesTable).where(eq(salesTable.id, params.data.id));

  // Restore inventory when a sale is removed
  await adjustInventory(existing.menuItem, existing.quantity, existing.storeId, "restore");

  res.sendStatus(204);
});

export default router;
