const prisma = require("../config/prisma");

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, name: true, email: true, createdAt: true }
        });
        res.json(user);
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: { name, email },
            select: { id: true, name: true, email: true }
        });
        res.json(user);
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};
