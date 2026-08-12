import express from "express";
import { authorizeRoles, enforceBaseAccess } from "../middleware/auth.js";
import { getAssignmentsList, createAssignmentRecord, recordAuditLog } from "../services/dataService.js";

const router = express.Router();

router.get("/", enforceBaseAccess, async (req, res) => {
  try {
    const assignments = await getAssignmentsList({ baseId: req.query.baseId });
    return res.json(assignments);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch assignments." });
  }
});

router.post("/", authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"), enforceBaseAccess, async (req, res) => {
  const { baseId, equipmentTypeId, personnel, quantity, notes } = req.body;

  const targetBaseId = Number(baseId);
  const eqTypeId = Number(equipmentTypeId);
  const qty = Number(quantity);

  if (!targetBaseId || !eqTypeId || !personnel || !qty || qty <= 0) {
    return res.status(400).json({ message: "Base, equipment type, personnel, and positive quantity are required." });
  }

  try {
    const assignment = await createAssignmentRecord(
      { baseId: targetBaseId, equipmentTypeId: eqTypeId, personnel: personnel.trim(), quantity: qty, notes: notes?.trim() || null },
      req.user.id
    );

    await recordAuditLog({
      userId: req.user.id,
      action: "ASSIGNMENT",
      details: `Assigned ${qty} units to personnel '${personnel.trim()}'.`,
      entityRef: `Assignment #${assignment.id}`,
      baseId: targetBaseId
    });

    return res.status(201).json({ message: "Asset assignment recorded successfully.", assignment });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to record assignment." });
  }
});

export default router;
