import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";

const app = express();

// logger (ONLY ONCE)
const logger = pinoHttp();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

// routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ ok: true });
});

export default app;
