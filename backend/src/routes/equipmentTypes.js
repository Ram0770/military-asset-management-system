import express from "express";
import { authorizeRoles } from "../middleware/auth.js";
import { getAllEquipmentTypes, createEquipmentType, recordAuditLog } from "../services/dataService.js";

const router = express.Router();

// GET /api/equipment-types - List all equipment types
router.get("/", async (req, res) => {
  try {
    const equipmentTypes = await getAllEquipmentTypes();
    return res.json(equipmentTypes);
  } catch (error) {
    console.error("Error fetching equipment types:", error);
    return res.status(500).json({ message: "Failed to fetch equipment types." });
  }
});

// POST /api/equipment-types - Create equipment type (Admin only)
router.post("/", authorizeRoles("ADMIN"), async (req, res) => {
  const { name, category, unit, description } = req.body;

  if (!name || !category || !unit) {
    return res.status(400).json({ message: "Name, category, and unit are required." });
  }

  try {
    const eqType = await createEquipmentType({
      name: name.trim(),
      category: category.toUpperCase(),
      unit: unit.trim().toLowerCase(),
      description: description?.trim() || null
    });

    await recordAuditLog({
      userId: req.user.id,
      action: "SYSTEM",
      details: `Added new equipment type '${eqType.name}' (${eqType.category})`
    });

    return res.status(201).json(eqType);
  } catch (error) {
    console.error("Error creating equipment type:", error);
    return res.status(500).json({ message: "Failed to create equipment type." });
  }
});

export default router;
