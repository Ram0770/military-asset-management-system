import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 5000;

// Security Middleware (Relax contentSecurityPolicy for inline scripts/styles in production)
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(cors({ origin: true, credentials: true }));
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

// Serve Frontend Static Dist Assets (Unified Single-Port Fullstack App)
const distPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(distPath));

// Fallback all non-API routes to index.html for Single-Page Application (SPA) Client Routing
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route endpoint not found." });
  }
  res.sendFile(path.join(distPath, "index.html"));
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
  console.log(`Unified Fullstack Military Asset Management System`);
  console.log(`Listening on Port: ${port}`);
  console.log(`Serving Frontend & API on single unified port!`);
  console.log(`=================================================`);
});

export default app;
