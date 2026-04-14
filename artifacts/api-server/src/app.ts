import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const pinoHttp = require("pino-http");

const app = express();

const logger = pinoHttp();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(corsOrigin ? { origin: corsOrigin.split(",").map((o) => o.trim()) } : undefined));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ ok: true });
});

export default app;
