import { Router, type IRouter } from "express";
import { eq, or, isNull, and } from "drizzle-orm";
import { db, inventoryTable, salesTable, recipesTable } from "@workspace/db";
import {
  GetRecommendationsResponse,
  GetDashboardSummaryResponse,
  GetRecommendationsQueryParams,
  GetDashboardSummaryQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recommendations", async (req, res): Promise<void> => {
  const query = GetRecommendationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { storeId, organizationId } = query.data;

  const inventoryWhere = storeId != null ? eq(inventoryTable.storeId, storeId) : isNull(inventoryTable.storeId);
  const salesWhere = storeId != null ? eq(salesTable.storeId, storeId) : isNull(salesTable.storeId);
  let recipesWhere;
  if (storeId != null && organizationId != null) {
    recipesWhere = or(eq(recipesTable.storeId, storeId), eq(recipesTable.organizationId, organizationId));
  } else if (storeId != null) {
    recipesWhere = eq(recipesTable.storeId, storeId);
  } else if (organizationId != null) {
    recipesWhere = eq(recipesTable.organizationId, organizationId);
  } else {
    recipesWhere = and(isNull(recipesTable.storeId), isNull(recipesTable.organizationId));
  }

  const [inventory, sales, recipes] = await Promise.all([
    db.select().from(inventoryTable).where(inventoryWhere),
    db.select().from(salesTable).where(salesWhere),
    db.select().from(recipesTable).where(recipesWhere),
  ]);

  const recipeMap = new Map(recipes.map((r) => [r.menuItem.toLowerCase(), r.ingredients]));
  const usage: Record<string, number> = {};
  for (const sale of sales) {
    const ingredients = recipeMap.get(sale.menuItem.toLowerCase());
    if (ingredients) {
      for (const ing of ingredients) {
        usage[ing.ingredientName.toLowerCase()] =
          (usage[ing.ingredientName.toLowerCase()] || 0) + ing.amountPerServing * sale.quantity;
      }
    }
  }

  const recommendations = [];
  for (const [ingredientName, totalUsed] of Object.entries(usage)) {
    const inv = inventory.find((i) => i.name.toLowerCase() === ingredientName);
    const currentStock = inv ? inv.stock : 0;
    const orderAmount = totalUsed - currentStock;
    if (orderAmount > 0) {
      recommendations.push({
        ingredientName: inv?.name ?? ingredientName,
        currentStock,
        unit: inv?.unit ?? "unit",
        totalUsed,
        orderAmount,
      });
    }
  }

  res.json(GetRecommendationsResponse.parse(recommendations));
});

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const query = GetDashboardSummaryQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { storeId, organizationId } = query.data;

  const inventoryWhere = storeId != null ? eq(inventoryTable.storeId, storeId) : isNull(inventoryTable.storeId);
  const salesWhere = storeId != null ? eq(salesTable.storeId, storeId) : isNull(salesTable.storeId);
  let recipesWhere;
  if (storeId != null && organizationId != null) {
    recipesWhere = or(eq(recipesTable.storeId, storeId), eq(recipesTable.organizationId, organizationId));
  } else if (storeId != null) {
    recipesWhere = eq(recipesTable.storeId, storeId);
  } else if (organizationId != null) {
    recipesWhere = eq(recipesTable.organizationId, organizationId);
  } else {
    recipesWhere = and(isNull(recipesTable.storeId), isNull(recipesTable.organizationId));
  }

  const [inventory, sales, recipes] = await Promise.all([
    db.select().from(inventoryTable).where(inventoryWhere),
    db.select().from(salesTable).where(salesWhere),
    db.select().from(recipesTable).where(recipesWhere),
  ]);

  const recipeMap = new Map(recipes.map((r) => [r.menuItem.toLowerCase(), r.ingredients]));
  const lowStockCount = inventory.filter((i) => i.minStock != null && i.stock <= i.minStock).length;

  const usage: Record<string, number> = {};
  for (const sale of sales) {
    const ingredients = recipeMap.get(sale.menuItem.toLowerCase());
    if (ingredients) {
      for (const ing of ingredients) {
        usage[ing.ingredientName.toLowerCase()] =
          (usage[ing.ingredientName.toLowerCase()] || 0) + ing.amountPerServing * sale.quantity;
      }
    }
  }

  let reorderCount = 0;
  for (const [ingredientName, totalUsed] of Object.entries(usage)) {
    const inv = inventory.find((i) => i.name.toLowerCase() === ingredientName);
    const currentStock = inv ? inv.stock : 0;
    if (totalUsed > currentStock) reorderCount++;
  }

  const menuTotals: Record<string, number> = {};
  for (const sale of sales) {
    menuTotals[sale.menuItem] = (menuTotals[sale.menuItem] || 0) + sale.quantity;
  }
  const topMenuItems = Object.entries(menuTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([menuItem, totalQty]) => ({ menuItem, totalQty }));

  res.json(
    GetDashboardSummaryResponse.parse({
      totalInventoryItems: inventory.length,
      totalSales: sales.length,
      totalRecipes: recipes.length,
      lowStockCount,
      reorderCount,
      topMenuItems,
    })
  );
});

export default router;
