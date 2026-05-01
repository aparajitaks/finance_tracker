const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "No token" });

    try {
        const decoded = jwt.verify(token, "secret");
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ msg: "Invalid token" });
    }
};