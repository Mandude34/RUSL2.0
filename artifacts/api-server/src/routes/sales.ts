import { Router, type IRouter } from "express";
import { eq, isNull } from "drizzle-orm";
import { db, salesTable } from "@workspace/db";
import {
  CreateSaleBody,
  DeleteSaleParams,
  ListSalesResponse,
  ListSalesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

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
  res.status(201).json(sale);
});

router.delete("/sales/:id", async (req, res): Promise<void> => {
  const params = DeleteSaleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [sale] = await db
    .delete(salesTable)
    .where(eq(salesTable.id, params.data.id))
    .returning();
  if (!sale) {
    res.status(404).json({ error: "Sale not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
