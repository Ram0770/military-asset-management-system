import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { authenticateToken } from "./middleware/auth.js";
import authRouter from "./routes/auth.js";
import basesRouter from "./routes/bases.js";
import equipmentTypesRouter from "./routes/equipmentTypes.js";
import assetsRouter from "./routes/assets.js";
import purchasesRouter from "./routes/purchases.js";
import transfersRouter from "./routes/transfers.js";
import assignmentsRouter from "./routes/assignments.js";
import expendituresRouter from "./routes/expenditures.js";
import auditLogsRouter from "./routes/auditLogs.js";
import usersRouter from "./routes/users.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Security & Middleware
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
        callback(null, true);
        return;
      }
      callback(new Error("CORS origin access blocked."));
    },
    credentials: true
  })
);
app.use(express.json());

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    system: "Military Asset Management System",
    timestamp: new Date().toISOString()
  });
});

// Public Authentication Route
app.use("/api/auth", authRouter);

// Protected API Routes
app.use("/api/bases", authenticateToken, basesRouter);
app.use("/api/equipment-types", authenticateToken, equipmentTypesRouter);
app.use("/api/assets", authenticateToken, assetsRouter);
app.use("/api/purchases", authenticateToken, purchasesRouter);
app.use("/api/transfers", authenticateToken, transfersRouter);
app.use("/api/assignments", authenticateToken, assignmentsRouter);
app.use("/api/expenditures", authenticateToken, expendituresRouter);
app.use("/api/audit-logs", authenticateToken, auditLogsRouter);
app.use("/api/users", authenticateToken, usersRouter);

// Global 404 Handler
app.use((_req, res) => {
  res.status(404).json({ message: "API route endpoint not found." });
});

// Secure Global Error Handler
app.use((error, _req, res, _next) => {
  console.error("Unhandled Application Error:", error);
  res.status(error.status || 500).json({
    message: error.message || "Internal server error."
  });
});

app.listen(port, () => {
  console.log(`=================================================`);
  console.log(`Military Asset Management System Backend Active`);
  console.log(`Listening on Port: ${port}`);
  console.log(`Allowed CORS Origins: ${allowedOrigins.join(", ")}`);
  console.log(`=================================================`);
});

export default app;
