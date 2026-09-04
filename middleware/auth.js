const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "secretkey";

// 🔐 VERIFY TOKEN
function verifyToken(req, res, next) {
    const rawHeader = req.headers.authorization || req.headers.token || req.headers["x-access-token"] || req.headers["x-auth-token"];

    if (!rawHeader) {
        return res.status(401).json({ message: "Login required ❌" });
    }

    let token = String(rawHeader).trim();
    if (token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
    }

    if (!token) {
        return res.status(401).json({ message: "Invalid token format ❌" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);

        // ✅ safe userId & user role
        req.userId = decoded.id || decoded._id;
        req.role = decoded.role || "user";
        req.user = {
            ...decoded,
            id: req.userId,
            _id: req.userId,
            role: req.role
        };

        if (!req.userId) {
            return res.status(401).json({ message: "Invalid token data ❌" });
        }

        next();

    } catch (err) {
        console.log("TOKEN ERROR:", err.message);
        return res.status(401).json({ message: "Invalid token ❌" });
    }
}


// 👑 ADMIN CHECK
function isAdmin(req, res, next) {
    // 🔥 allow role, isAdmin, or decoded role
    const isAdminUser =
        (req.user && (req.user.role === "admin" || req.user.isAdmin === true)) ||
        req.role === "admin";

    if (!isAdminUser) {
        return res.status(403).json({ message: "Admin only ❌" });
    }

    next();
}

module.exports = {
    verifyToken,
    isAdmin
};