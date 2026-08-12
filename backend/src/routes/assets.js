import express from "express";
import { enforceBaseAccess } from "../middleware/auth.js";
import { getAssetsList, getDashboardData } from "../services/dataService.js";

const router = express.Router();

// GET /api/assets - List current inventory records
router.get("/", enforceBaseAccess, async (req, res) => {
  const { baseId, equipmentTypeId, category, search } = req.query;

  try {
    const assets = await getAssetsList({ baseId, equipmentTypeId, category, search });
    return res.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return res.status(500).json({ message: "Failed to fetch inventory assets." });
  }
});

// GET /api/assets/dashboard - Consolidated Dynamic Inventory Dashboard
router.get("/dashboard", enforceBaseAccess, async (req, res) => {
  const { baseId, equipmentTypeId, startDate, endDate } = req.query;

  try {
    const dashboard = await getDashboardData({ baseId, equipmentTypeId, startDate, endDate });
    return res.json(dashboard);
  } catch (error) {
    console.error("Error generating asset dashboard:", error);
    return res.status(500).json({ message: "Failed to load dashboard statistics." });
  }
});

export default router;
