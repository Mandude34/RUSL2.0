import { pgTable, text, serial, timestamp, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { storesTable } from "./stores";

export const wasteLogsTable = pgTable("waste_logs", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => storesTable.id, { onDelete: "cascade" }),
  ingredientName: text("ingredient_name").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWasteLogSchema = createInsertSchema(wasteLogsTable).omit({ id: true, createdAt: true });
export type InsertWasteLog = z.infer<typeof insertWasteLogSchema>;
export type WasteLog = typeof wasteLogsTable.$inferSelect;
