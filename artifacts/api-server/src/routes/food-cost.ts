import { Router, type IRouter } from "express";
import { eq, or, isNull, and } from "drizzle-orm";
import { db, recipesTable, inventoryTable, salesTable, storesTable } from "@workspace/db";
import { GetFoodCostReportQueryParams, GetFoodCostReportResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/food-cost", async (req, res): Promise<void> => {
  const query = GetFoodCostReportQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { storeId, organizationId } = query.data;

  // Resolve orgId from storeId if not provided
  let orgId = organizationId ?? null;
  if (storeId != null && orgId == null) {
    const [store] = await db.select().from(storesTable).where(eq(storesTable.id, storeId));
    orgId = store?.organizationId ?? null;
  }

  // Fetch recipes
  let recipeWhereClause;
  if (storeId != null && orgId != null) {
    recipeWhereClause = or(
      eq(recipesTable.storeId, storeId),
      eq(recipesTable.organizationId, orgId)
    );
  } else if (storeId != null) {
    recipeWhereClause = eq(recipesTable.storeId, storeId);
  } else if (orgId != null) {
    recipeWhereClause = eq(recipesTable.organizationId, orgId);
  } else {
    recipeWhereClause = and(isNull(recipesTable.storeId), isNull(recipesTable.organizationId));
  }

  const recipes = await db.select().from(recipesTable).where(recipeWhereClause);

  // Fetch inventory for cost lookup
  const inventory = await db
    .select()
    .from(inventoryTable)
    .where(
      storeId != null ? eq(inventoryTable.storeId, storeId) : isNull(inventoryTable.storeId)
    );

  const inventoryMap = new Map(inventory.map((i) => [i.name.toLowerCase(), i]));

  // Fetch sales for revenue calculation
  const sales = await db
    .select()
    .from(salesTable)
    .where(
      storeId != null ? eq(salesTable.storeId, storeId) : isNull(salesTable.storeId)
    );

  // Build qty sold per menu item
  const qtySoldMap = new Map<string, number>();
  let totalRevenue = 0;
  for (const sale of sales) {
    const key = sale.menuItem.toLowerCase();
    qtySoldMap.set(key, (qtySoldMap.get(key) ?? 0) + sale.quantity);
    if (sale.salePrice != null) {
      totalRevenue += sale.salePrice * sale.quantity;
    }
  }

  // Deduplicate recipes by menuItem (prefer store-specific)
  const recipeMap = new Map<string, typeof recipes[0]>();
  for (const r of recipes) {
    const key = r.menuItem.toLowerCase();
    if (!recipeMap.has(key) || (r.storeId != null)) {
      recipeMap.set(key, r);
    }
  }

  let totalIngredientCost = 0;
  let totalFoodCostWeighted = 0;
  let weightedCount = 0;

  const items = Array.from(recipeMap.values()).map((recipe) => {
    const ingredientDetails = recipe.ingredients.map((ing) => {
      const inv = inventoryMap.get(ing.ingredientName.toLowerCase());
      const costPerUnit = inv?.costPerUnit ?? null;
      const lineCost = costPerUnit != null ? costPerUnit * ing.amountPerServing : null;
      return {
        ingredientName: ing.ingredientName,
        amountPerServing: ing.amountPerServing,
        unit: inv?.unit ?? "",
        costPerUnit: costPerUnit ?? undefined,
        lineCost: lineCost ?? undefined,
      };
    });

    const ingredientCost = ingredientDetails.reduce(
      (sum, i) => sum + (i.lineCost ?? 0),
      0
    );

    const menuPrice = recipe.menuPrice ?? undefined;
    const foodCostPct =
      menuPrice != null && menuPrice > 0
        ? (ingredientCost / menuPrice) * 100
        : undefined;

    const qtySold = qtySoldMap.get(recipe.menuItem.toLowerCase()) ?? 0;
    totalIngredientCost += ingredientCost * qtySold;

    if (foodCostPct != null) {
      totalFoodCostWeighted += foodCostPct;
      weightedCount++;
    }

    return {
      menuItem: recipe.menuItem,
      menuPrice,
      ingredientCost,
      foodCostPct,
      ingredients: ingredientDetails,
    };
  });

  const avgFoodCostPct = weightedCount > 0 ? totalFoodCostWeighted / weightedCount : 0;

  const report = {
    items,
    totalRevenue,
    totalIngredientCost,
    avgFoodCostPct,
  };

  res.json(GetFoodCostReportResponse.parse(report));
});

export default router;
