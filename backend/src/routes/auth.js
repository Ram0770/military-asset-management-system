import express from "express";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/auth.js";
import { findUserByUsername, recordAuditLog } from "../services/dataService.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = createToken(user);

    await recordAuditLog({
      userId: user.id,
      action: "AUTH",
      details: `User '${user.username}' logged in successfully.`,
      baseId: user.baseId
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        baseId: user.baseId,
        baseName: user.base?.name || "Global / Unassigned"
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Authentication server error." });
  }
});

export default router;
