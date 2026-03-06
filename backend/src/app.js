import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import recordsRouter from "./routes/records.js";
import { requireAuth } from "./middleware/auth.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin denied"));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api/health", healthRouter);
app.use("/api/auth", requireAuth, authRouter);
app.use("/api/records", requireAuth, recordsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
