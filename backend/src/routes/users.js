import express from "express";
import { authorizeRoles } from "../middleware/auth.js";
import { getAllUsersList, createUserAccount, recordAuditLog } from "../services/dataService.js";

const router = express.Router();

router.get("/", authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const users = await getAllUsersList();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users." });
  }
});

router.post("/", authorizeRoles("ADMIN"), async (req, res) => {
  const { name, username, email, password, role, baseId } = req.body;

  if (!name || !username || !password || !role) {
    return res.status(400).json({ message: "Name, username, password, and role are required." });
  }

  try {
    const user = await createUserAccount({ name, username, email, password, role, baseId });

    await recordAuditLog({
      userId: req.user.id,
      action: "SYSTEM",
      details: `Created user account '${user.username}' (${user.role})`
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create user account." });
  }
});

export default router;
