const adminAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.replace("Bearer ", "");
    // Simple verification for prototype
    if (token !== "valid-admin-token-12345") {
        return res.status(403).json({ error: "Invalid token" });
    }
    next();
};

module.exports = adminAuth;
