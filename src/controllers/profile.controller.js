const prisma = require("../config/prisma");

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, name: true, email: true, createdAt: true }
        });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name && !email) {
            return res.status(400).json({ msg: "Provide name or email to update" });
        }

        // Check for duplicate email before updating
        if (email) {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing && existing.id !== req.userId) {
                return res.status(409).json({ msg: "Email already in use by another account" });
            }
        }

        // Build partial update — only include provided fields
        const data = {};
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;

        const user = await prisma.user.update({
            where: { id: req.userId },
            data,
            select: { id: true, name: true, email: true }
        });
        res.json(user);
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};
