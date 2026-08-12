import express from "express";
import { authorizeRoles, enforceBaseAccess } from "../middleware/auth.js";
import { getExpendituresList, createExpenditureRecord, recordAuditLog } from "../services/dataService.js";

const router = express.Router();

router.get("/", enforceBaseAccess, async (req, res) => {
  try {
    const expenditures = await getExpendituresList({ baseId: req.query.baseId });
    return res.json(expenditures);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch expenditures." });
  }
});

router.post("/", authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"), enforceBaseAccess, async (req, res) => {
  const { baseId, equipmentTypeId, quantity, reason, notes } = req.body;

  const targetBaseId = Number(baseId);
  const eqTypeId = Number(equipmentTypeId);
  const qty = Number(quantity);

  if (!targetBaseId || !eqTypeId || !reason || !qty || qty <= 0) {
    return res.status(400).json({ message: "Base, equipment type, reason, and positive quantity are required." });
  }

  try {
    const expenditure = await createExpenditureRecord(
      { baseId: targetBaseId, equipmentTypeId: eqTypeId, quantity: qty, reason: reason.trim(), notes: notes?.trim() || null },
      req.user.id
    );

    await recordAuditLog({
      userId: req.user.id,
      action: "EXPENDITURE",
      details: `Expended ${qty} units. Reason: ${reason.trim()}`,
      entityRef: `Expenditure #${expenditure.id}`,
      baseId: targetBaseId
    });

    return res.status(201).json({ message: "Stock expenditure recorded successfully.", expenditure });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to record expenditure." });
  }
});

export default router;
