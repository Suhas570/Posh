// ============================================================
// DEMO MODE CONFIGURATION
// ============================================================
// When DEMO_MODE is true, the authorize middleware allows
// access to all roles. This is used for client demos.
// ============================================================
const DEMO_MODE = process.env.DEMO_MODE === 'true' || true;

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, no user session' });
    }

    // In DEMO_MODE, allow access regardless of role
    if (DEMO_MODE) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};
