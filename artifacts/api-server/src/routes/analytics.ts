import { Router, type IRouter } from "express";
import { eq, isNull } from "drizzle-orm";
import { db, inventoryTable, salesTable, recipesTable } from "@workspace/db";
import { GetAnalyticsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics", async (req, res): Promise<void> => {
  const query = GetAnalyticsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { storeId } = query.data;

  const salesWhere = storeId != null
    ? eq(salesTable.storeId, storeId)
    : isNull(salesTable.storeId);

  const inventoryWhere = storeId != null
    ? eq(inventoryTable.storeId, storeId)
    : isNull(inventoryTable.storeId);

  const [sales, inventory, recipes] = await Promise.all([
    db.select().from(salesTable).where(salesWhere),
    db.select().from(inventoryTable).where(inventoryWhere),
    db.select().from(recipesTable).where(
      storeId != null
        ? eq(recipesTable.storeId, storeId)
        : isNull(recipesTable.storeId)
    ),
  ]);

  // 1. Sales by menu item (all time)
  const itemTotals: Record<string, number> = {};
  let grandTotal = 0;
  for (const sale of sales) {
    itemTotals[sale.menuItem] = (itemTotals[sale.menuItem] || 0) + sale.quantity;
    grandTotal += sale.quantity;
  }
  const salesByItem = Object.entries(itemTotals)
    .map(([menuItem, totalQty]) => ({
      menuItem,
      totalQty: Math.round(totalQty * 10) / 10,
      percentage: grandTotal > 0 ? Math.round((totalQty / grandTotal) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.totalQty - a.totalQty);

  // 2. Daily sales totals (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSales = sales.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);

  const dailyMap: Record<string, number> = {};
  for (const sale of recentSales) {
    const date = new Date(sale.createdAt).toISOString().split("T")[0];
    dailyMap[date] = (dailyMap[date] || 0) + sale.quantity;
  }

  // Fill in missing days with 0 for a continuous chart
  const dailySales: { date: string; totalQty: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    dailySales.push({ date: dateStr, totalQty: Math.round((dailyMap[dateStr] || 0) * 10) / 10 });
  }

  // 3. Stock consumption estimated from sales × recipe amounts
  const consumptionMap: Record<string, {
    unit: string;
    estimatedUsed: number;
    currentStock: number;
    minStock: number | null;
  }> = {};

  for (const inv of inventory) {
    consumptionMap[inv.name] = {
      unit: inv.unit,
      estimatedUsed: 0,
      currentStock: inv.stock,
      minStock: inv.minStock ?? null,
    };
  }

  for (const recipe of recipes) {
    const totalRecipeSales = sales
      .filter(s => s.menuItem === recipe.menuItem)
      .reduce((sum, s) => sum + s.quantity, 0);

    for (const ingredient of (recipe.ingredients as { ingredientName: string; amountPerServing: number }[])) {
      if (consumptionMap[ingredient.ingredientName] !== undefined) {
        consumptionMap[ingredient.ingredientName].estimatedUsed +=
          totalRecipeSales * ingredient.amountPerServing;
      }
    }
  }

  const stockConsumption = Object.entries(consumptionMap)
    .filter(([_, d]) => d.estimatedUsed > 0)
    .map(([ingredientName, d]) => ({
      ingredientName,
      unit: d.unit,
      currentStock: Math.round(d.currentStock * 10) / 10,
      estimatedUsed: Math.round(d.estimatedUsed * 10) / 10,
      minStock: d.minStock,
      variance: Math.round((d.currentStock - d.estimatedUsed) * 10) / 10,
    }))
    .sort((a, b) => b.estimatedUsed - a.estimatedUsed);

  res.json({
    salesByItem,
    dailySales,
    stockConsumption,
    totalUnitsSold: Math.round(grandTotal * 10) / 10,
    totalTransactions: sales.length,
  });
});

export default router;
