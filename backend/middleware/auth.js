import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, full_name }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Role hierarchy (higher index = more permissions)
const ROLE_LEVELS = {
  VIEWER: 0,
  SALES_MANAGER: 1,
  CONTENT_EDITOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated." });
    const userLevel = ROLE_LEVELS[req.user.role] ?? -1;
    const allowed = allowedRoles.some(
      (r) => (ROLE_LEVELS[r] ?? -1) <= userLevel,
    );
    if (!allowed) {
      return res.status(403).json({ error: "Insufficient permissions." });
    }
    next();
  };
}

// Shorthand aliases
export const requireAdmin = authorize("ADMIN");
export const requireSuperAdmin = authorize("SUPER_ADMIN");
export const requireContentEditor = authorize("CONTENT_EDITOR");
export const requireSales = authorize("SALES_MANAGER");
