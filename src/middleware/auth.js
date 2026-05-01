import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ msg: "No token" });

    try {
        const decoded = jwt.verify(token, "secret");
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ msg: "Invalid token" });
    }
};