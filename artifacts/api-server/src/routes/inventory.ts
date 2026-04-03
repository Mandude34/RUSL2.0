import { Router, type IRouter } from "express";
import { eq, and, isNull } from "drizzle-orm";
import { db, inventoryTable } from "@workspace/db";
import {
  CreateInventoryItemBody,
  UpdateInventoryItemBody,
  UpdateInventoryItemParams,
  DeleteInventoryItemParams,
  ListInventoryResponse,
  ListInventoryQueryParams,
  UpdateInventoryItemResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/inventory", async (req, res): Promise<void> => {
  const query = ListInventoryQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { storeId } = query.data;
  const rows = await db
    .select()
    .from(inventoryTable)
    .where(
      storeId != null
        ? eq(inventoryTable.storeId, storeId)
        : isNull(inventoryTable.storeId)
    )
    .orderBy(inventoryTable.name);
  const items = rows.map((r) => ({
    ...r,
    costPerUnit: r.costPerUnit ?? undefined,
    minStock: r.minStock ?? undefined,
  }));
  res.json(ListInventoryResponse.parse(items));
});

router.post("/inventory", async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(inventoryTable).values(parsed.data).returning();
  res.status(201).json(UpdateInventoryItemResponse.parse({
    ...item,
    costPerUnit: item.costPerUnit ?? undefined,
    minStock: item.minStock ?? undefined,
  }));
});

router.put("/inventory/:id", async (req, res): Promise<void> => {
  const params = UpdateInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(inventoryTable)
    .set(parsed.data)
    .where(eq(inventoryTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(UpdateInventoryItemResponse.parse({
    ...item,
    costPerUnit: item.costPerUnit ?? undefined,
    minStock: item.minStock ?? undefined,
  }));
});

router.delete("/inventory/:id", async (req, res): Promise<void> => {
  const params = DeleteInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db
    .delete(inventoryTable)
    .where(eq(inventoryTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
