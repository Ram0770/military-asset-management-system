import express from "express";
import { authorizeRoles } from "../middleware/auth.js";
import { getAuditLogsList } from "../services/dataService.js";

const router = express.Router();

router.get("/", authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const logs = await getAuditLogsList({ action: req.query.action, baseId: req.query.baseId });
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch audit logs." });
  }
});

export default router;
