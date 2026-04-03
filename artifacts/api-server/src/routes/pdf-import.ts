import { Router } from "express";
import multer from "multer";
import { createRequire } from "module";
import { openai } from "@workspace/integrations-openai-ai-server";

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse: (buf: Buffer) => Promise<{ text: string }> = require("pdf-parse");

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/usage/import-pdf", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No PDF file uploaded" });
    return;
  }

  let rawText: string;
  try {
    const parsed = await pdfParse(req.file.buffer);
    rawText = parsed.text;
  } catch {
    res.status(422).json({ error: "Could not read PDF. Make sure it contains selectable text." });
    return;
  }

  if (!rawText.trim()) {
    res.status(422).json({ error: "PDF appears to be empty or image-only (no selectable text found)." });
    return;
  }

  const systemPrompt = `You are a data extraction assistant for a kitchen inventory system.
Extract product usage entries from the provided document text.
Return a JSON array of objects. Each object must have:
  - "menuItem": string (the product or item name, required)
  - "quantity": number (integer ≥ 1, required)
  - "salePrice": number or null (unit price if visible, else null)
  - "date": string or null (ISO date like "2024-03-15" if a date is visible, else null)
  - "note": string or null (any extra context such as supplier, batch, or reason)

Rules:
- Only extract real product line items, skip totals, subtotals, and headers.
- Round quantities to the nearest whole number.
- If a quantity is fractional (e.g. 2.5 kg), round up to 3 and add a note about the original value.
- If you cannot find any valid line items, return an empty array [].
- Return ONLY the JSON array, no markdown, no extra text.`;

  let items: Array<{ menuItem: string; quantity: number; salePrice: number | null; date: string | null; note: string | null }>;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: rawText.slice(0, 8000) },
      ],
      temperature: 0,
    });

    const content = completion.choices[0]?.message?.content ?? "[]";
    items = JSON.parse(content);
    if (!Array.isArray(items)) items = [];
  } catch {
    res.status(500).json({ error: "AI extraction failed. Please try again." });
    return;
  }

  res.json({ items, rawText: rawText.slice(0, 2000) });
});

export default router;
