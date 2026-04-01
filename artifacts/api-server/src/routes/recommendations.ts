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

// Since stock is deducted in real-time when sales are logged,
// recommendations are based on current stock levels vs minStock thresholds.
// Items without minStock are flagged if stock has reached 0.
function buildRecommendations(inventory: (typeof inventoryTable.$inferSelect)[]) {
  const recommendations = [];
  for (const item of inventory) {
    if (item.minStock != null && item.stock <= item.minStock) {
      recommendations.push({
        ingredientName: item.name,
        currentStock: item.stock,
        unit: item.unit,
        totalUsed: 0,
        orderAmount: Math.max(0, item.minStock * 2 - item.stock), // suggest restocking to 2x minStock
      });
    } else if (item.minStock == null && item.stock <= 0) {
      recommendations.push({
        ingredientName: item.name,
        currentStock: 0,
        unit: item.unit,
        totalUsed: 0,
        orderAmount: 10, // suggest a default reorder quantity
      });
    }
  }
  return recommendations;
}

router.get("/recommendations", async (req, res): Promise<void> => {
  const query = GetRecommendationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { storeId } = query.data;

  const inventoryWhere = storeId != null
    ? eq(inventoryTable.storeId, storeId)
    : isNull(inventoryTable.storeId);

  const inventory = await db.select().from(inventoryTable).where(inventoryWhere);
  const recommendations = buildRecommendations(inventory);
  res.json(GetRecommendationsResponse.parse(recommendations));
});

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const query = GetDashboardSummaryQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { storeId, organizationId } = query.data;

  const inventoryWhere = storeId != null
    ? eq(inventoryTable.storeId, storeId)
    : isNull(inventoryTable.storeId);

  const salesWhere = storeId != null
    ? eq(salesTable.storeId, storeId)
    : isNull(salesTable.storeId);

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

  const lowStockCount = inventory.filter(
    (i) => i.minStock != null && i.stock <= i.minStock
  ).length;

  const reorderCount = buildRecommendations(inventory).length;

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
