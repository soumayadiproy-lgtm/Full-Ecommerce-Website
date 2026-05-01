const jwt = require("jsonwebtoken");
const SECRET = "secretkey";

// 🔐 VERIFY TOKEN
function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Login required ❌" });
    }

    // 🔥 check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid token format ❌" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET);

        console.log("DECODED TOKEN:", decoded);

        // ✅ attach full user object
        req.user = decoded;

        // ✅ safe userId
        req.userId = decoded.id || decoded._id;

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

    console.log("CHECK ADMIN:", req.user);

    // 🔥 allow both role and isAdmin
    const isAdminUser =
        req.user &&
        (req.user.role === "admin" || req.user.isAdmin === true);

    if (!isAdminUser) {
        return res.status(403).json({ message: "Admin only ❌" });
    }

    next();
}

module.exports = {
    verifyToken,
    isAdmin
};