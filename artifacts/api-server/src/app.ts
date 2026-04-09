import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as pinoHttp from "pino-http";

const app = express();

// FIXED LOGGER
const logger = pinoHttp.default();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ ok: true });
});

export default app;
