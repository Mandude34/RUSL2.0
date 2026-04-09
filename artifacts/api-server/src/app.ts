import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const pinoHttp = require("pino-http");

const app = express();

const logger = pinoHttp();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ ok: true });
});

export default app;
