import express from "express";
import { authorizeRoles, enforceBaseAccess } from "../middleware/auth.js";
import { getPurchasesList, createPurchaseRecord, recordAuditLog } from "../services/dataService.js";

const router = express.Router();

router.get("/", enforceBaseAccess, async (req, res) => {
  try {
    const purchases = await getPurchasesList({ baseId: req.query.baseId });
    return res.json(purchases);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch purchases." });
  }
});

router.post("/", authorizeRoles("ADMIN", "LOGISTICS_OFFICER"), enforceBaseAccess, async (req, res) => {
  const { baseId, equipmentTypeId, quantity, vendor, notes } = req.body;

  if (!baseId || !equipmentTypeId || !quantity || quantity <= 0 || !vendor) {
    return res.status(400).json({ message: "Base, equipment type, positive quantity, and vendor are required." });
  }

  try {
    const purchase = await createPurchaseRecord(
      {
        baseId: Number(baseId),
        equipmentTypeId: Number(equipmentTypeId),
        quantity: Number(quantity),
        vendor: vendor.trim(),
        notes: notes?.trim() || null
      },
      req.user.id
    );

    await recordAuditLog({
      userId: req.user.id,
      action: "PURCHASE",
      details: `Purchased ${quantity} units from vendor '${vendor.trim()}'.`,
      entityRef: `Purchase #${purchase.id}`,
      baseId: Number(baseId)
    });

    return res.status(201).json({ message: "Purchase recorded successfully.", purchase });
  } catch (error) {
    return res.status(500).json({ message: "Failed to record purchase." });
  }
});

export default router;
