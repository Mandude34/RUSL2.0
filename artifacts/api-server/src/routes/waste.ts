import { Router, type IRouter } from "express";
import { eq, isNull } from "drizzle-orm";
import { db, wasteLogsTable } from "@workspace/db";
import {
  CreateWasteLogBody,
  DeleteWasteLogParams,
  ListWasteLogsResponse,
  ListWasteLogsQueryParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/waste", async (req, res): Promise<void> => {
  const query = ListWasteLogsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { storeId } = query.data;
  const logs = await db
    .select()
    .from(wasteLogsTable)
    .where(
      storeId != null
        ? eq(wasteLogsTable.storeId, storeId)
        : isNull(wasteLogsTable.storeId)
    )
    .orderBy(wasteLogsTable.createdAt);
  res.json(ListWasteLogsResponse.parse(logs));
});

router.post("/waste", async (req, res): Promise<void> => {
  const parsed = CreateWasteLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [log] = await db.insert(wasteLogsTable).values(parsed.data).returning();
  logger.debug({ log }, "Waste logged");
  res.status(201).json(log);
});

router.delete("/waste/:id", async (req, res): Promise<void> => {
  const params = DeleteWasteLogParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [existing] = await db
    .select()
    .from(wasteLogsTable)
    .where(eq(wasteLogsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Waste log not found" });
    return;
  }

  await db.delete(wasteLogsTable).where(eq(wasteLogsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
