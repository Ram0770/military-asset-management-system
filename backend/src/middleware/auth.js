import jwt from "jsonwebtoken";
import { findUserById } from "../services/dataService.js";

const JWT_SECRET = process.env.JWT_SECRET || "military-asset-management-super-secret-key";

export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      baseId: user.baseId,
      baseName: user.base?.name || null
    },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication token required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Fetch latest user data using dataService (handles Postgres & Fallback)
    const user = await findUserById(payload.id);

    if (!user) {
      return res.status(401).json({ message: "User account no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Role '${req.user.role}' is not authorized for this resource.` 
      });
    }

    next();
  };
}

export function enforceBaseAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  if (req.user.role === "ADMIN") {
    return next();
  }

  if (!req.user.baseId) {
    return res.status(403).json({ message: "User is not assigned to any military base." });
  }

  req.query.baseId = req.user.baseId.toString();
  
  if (req.body && typeof req.body === "object") {
    req.body.baseId = req.user.baseId;
  }

  next();
}
