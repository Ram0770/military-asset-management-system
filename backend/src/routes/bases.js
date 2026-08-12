import express from "express";
import { authorizeRoles } from "../middleware/auth.js";
import { getAllBases, createBase, recordAuditLog } from "../services/dataService.js";

const router = express.Router();

// GET /api/bases - List all bases
router.get("/", async (req, res) => {
  try {
    const bases = await getAllBases(req.user.role === "ADMIN" ? null : req.user.baseId);
    return res.json(bases);
  } catch (error) {
    console.error("Error fetching bases:", error);
    return res.status(500).json({ message: "Failed to fetch bases." });
  }
});

// POST /api/bases - Create base (Admin only)
router.post("/", authorizeRoles("ADMIN"), async (req, res) => {
  const { name, code, location } = req.body;

  if (!name || !code || !location) {
    return res.status(400).json({ message: "Base name, code, and location are required." });
  }

  try {
    const base = await createBase({ name: name.trim(), code: code.trim().toUpperCase(), location: location.trim() });

    await recordAuditLog({
      userId: req.user.id,
      action: "SYSTEM",
      details: `Created military base '${base.name}' (${base.code})`,
      baseId: base.id
    });

    return res.status(201).json(base);
  } catch (error) {
    console.error("Error creating base:", error);
    return res.status(500).json({ message: "Failed to create base." });
  }
});

export default router;
