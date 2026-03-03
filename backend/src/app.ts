import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { appRouter } from "./routes.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { env } from "./config/env.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(appRouter);
app.use(notFound);
app.use(errorHandler);
