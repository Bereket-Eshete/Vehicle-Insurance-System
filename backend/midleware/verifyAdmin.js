export const verifyAdmin = (req, res, next) => {
  if (req.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
};
