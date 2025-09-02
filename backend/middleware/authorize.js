/**
 * @desc    Authorization middleware to check for specific roles
 * @param   {...string} allowedRoles - A list of roles that are allowed to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: "Forbidden: No role specified" });
    }

    const userRole = req.user.role;

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({ error: "Forbidden: You do not have permission to perform this action" });
    }
  };
};

module.exports = authorize;
