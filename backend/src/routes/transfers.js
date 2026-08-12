import express from "express";
import { authorizeRoles, enforceBaseAccess } from "../middleware/auth.js";
import { getTransfersList, createTransferRecord, recordAuditLog } from "../services/dataService.js";

const router = express.Router();

router.get("/", enforceBaseAccess, async (req, res) => {
  try {
    const transfers = await getTransfersList({ baseId: req.query.baseId });
    return res.json(transfers);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch transfers." });
  }
});

router.post("/", authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"), enforceBaseAccess, async (req, res) => {
  const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity, notes } = req.body;

  const srcBaseId = Number(sourceBaseId);
  const destBaseId = Number(destinationBaseId);
  const eqTypeId = Number(equipmentTypeId);
  const qty = Number(quantity);

  if (!srcBaseId || !destBaseId || !eqTypeId || !qty || qty <= 0) {
    return res.status(400).json({ message: "Source base, destination base, equipment type, and positive quantity are required." });
  }

  if (srcBaseId === destBaseId) {
    return res.status(400).json({ message: "Source and destination base cannot be identical." });
  }

  if (req.user.role !== "ADMIN" && req.user.baseId !== srcBaseId) {
    return res.status(403).json({ message: "You can only transfer assets from your assigned base." });
  }

  try {
    const transfer = await createTransferRecord(
      { sourceBaseId: srcBaseId, destinationBaseId: destBaseId, equipmentTypeId: eqTypeId, quantity: qty, notes: notes?.trim() || null },
      req.user.id
    );

    await recordAuditLog({
      userId: req.user.id,
      action: "TRANSFER",
      details: `Transferred ${qty} units from Base ID ${srcBaseId} to Base ID ${destBaseId}.`,
      entityRef: `Transfer #${transfer.id}`,
      baseId: srcBaseId
    });

    return res.status(201).json({ message: "Cross-base transfer completed successfully.", transfer });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to complete transfer." });
  }
});

export default router;
