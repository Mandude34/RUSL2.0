import { Router, type IRouter } from "express";
import { eq, isNull, gte } from "drizzle-orm";
import { db, inventoryTable, salesTable, recipesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GetAIPredictionsQueryParams, GetAIPredictionsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/predictions", async (req, res): Promise<void> => {
  const query = GetAIPredictionsQueryParams.safeParse(req.query);
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

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const [inventory, allSales, recipes] = await Promise.all([
    db.select().from(inventoryTable).where(inventoryWhere),
    db.select().from(salesTable).where(salesWhere),
    db.select().from(recipesTable).where(
      storeId != null
        ? eq(recipesTable.storeId, storeId)
        : isNull(recipesTable.storeId)
    ),
  ]);

  const recentSales = allSales.filter(
    (s) => new Date(s.createdAt) >= eightWeeksAgo
  );

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const salesByDayOfWeek: Record<string, Record<string, number>> = {};
  const salesByWeek: Record<string, Record<string, number>> = {};

  for (const sale of recentSales) {
    const date = new Date(sale.createdAt);
    const day = DAYS[date.getDay()];
    const weekNum = Math.floor((Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weekKey = `week_${weekNum}`;

    if (!salesByDayOfWeek[sale.menuItem]) salesByDayOfWeek[sale.menuItem] = {};
    salesByDayOfWeek[sale.menuItem][day] = (salesByDayOfWeek[sale.menuItem][day] || 0) + sale.quantity;

    if (!salesByWeek[sale.menuItem]) salesByWeek[sale.menuItem] = {};
    salesByWeek[sale.menuItem][weekKey] = (salesByWeek[sale.menuItem][weekKey] || 0) + sale.quantity;
  }

  const inventorySummary = inventory.map((i) => ({
    name: i.name,
    stock: i.stock,
    unit: i.unit,
    minStock: i.minStock,
  }));

  const recipesSummary = recipes.map((r) => ({
    menuItem: r.menuItem,
    ingredients: r.ingredients as { ingredientName: string; amountPerServing: number }[],
  }));

  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7 || 7);
  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);
  const predictedPeriod = `${nextMonday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${nextSunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const systemPrompt = `You are an AI assistant for FlowStock, a kitchen inventory management system for food businesses.
Your job is to analyze real sales data and predict ingredient orders for the upcoming week.
Respond ONLY with valid JSON matching the exact schema provided. No markdown, no explanation outside the JSON.`;

  const userPrompt = `Analyze this kitchen's sales data and predict what ingredients need to be ordered for next week.

TODAY: ${today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
PREDICTED PERIOD: ${predictedPeriod}

SALES BY DAY OF WEEK (last 8 weeks total per day):
${JSON.stringify(salesByDayOfWeek, null, 2)}

WEEKLY SALES TOTALS (week_0 = this week, week_1 = last week, etc.):
${JSON.stringify(salesByWeek, null, 2)}

CURRENT INVENTORY:
${JSON.stringify(inventorySummary, null, 2)}

RECIPES (ingredients used per serving sold):
${JSON.stringify(recipesSummary, null, 2)}

Based on the trends above, predict next week's ingredient needs. For each ingredient used in recipes:
1. Estimate predicted total usage across the week (based on projected menu item sales)
2. Calculate how much to order (predictedUsage minus currentStock, minimum 0)
3. Identify the trend (Increasing / Stable / Decreasing) based on week-over-week data
4. Write a brief, useful insight (1 sentence, specific to the data)

If sales data is limited or missing for some items, make reasonable estimates and note lower confidence.

Respond with this EXACT JSON structure:
{
  "summary": "brief overall summary of the forecast (2-3 sentences)",
  "predictedPeriod": "${predictedPeriod}",
  "confidence": "High | Medium | Low",
  "items": [
    {
      "ingredientName": "exact name from inventory",
      "currentStock": <number from inventory>,
      "unit": "unit from inventory",
      "predictedUsage": <predicted total usage for the week>,
      "suggestedOrder": <max(0, predictedUsage - currentStock)>,
      "trend": "Increasing | Stable | Decreasing",
      "insight": "one specific insight about this ingredient"
    }
  ],
  "notes": "any important caveats or additional context",
  "generatedAt": "${new Date().toISOString()}"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    res.status(500).json({ error: "Failed to parse AI response" });
    return;
  }

  const validated = GetAIPredictionsResponse.safeParse(parsed);
  if (!validated.success) {
    res.status(500).json({ error: "AI response did not match expected schema" });
    return;
  }

  res.json(validated.data);
});

export default router;
