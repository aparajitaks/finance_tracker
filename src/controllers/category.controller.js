const prisma = require("../config/prisma");

// Default categories to seed for the system
const DEFAULT_CATEGORIES = [
    { name: "Salary", type: "income" },
    { name: "Freelance", type: "income" },
    { name: "Investment", type: "income" },
    { name: "Gift", type: "income" },
    { name: "Food", type: "expense" },
    { name: "Transport", type: "expense" },
    { name: "Shopping", type: "expense" },
    { name: "Bills", type: "expense" },
    { name: "Entertainment", type: "expense" },
    { name: "Health", type: "expense" },
    { name: "Education", type: "expense" },
    { name: "Other", type: "expense" },
];

exports.createCategory = async (req, res) => {
    try {
        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({ msg: "name and type are required" });
        }

        if (!["income", "expense"].includes(type)) {
            return res
                .status(400)
                .json({ msg: "type must be 'income' or 'expense'" });
        }

        const existing = await prisma.category.findFirst({
            where: { name, type },
        });
        if (existing) {
            return res.status(409).json({ msg: "Category already exists", category: existing });
        }

        const category = await prisma.category.create({
            data: { name, type },
        });

        res.status(201).json(category);
    } catch (err) {
        console.error("Create category error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const { type } = req.query; // optional filter: ?type=income or ?type=expense

        const where = type ? { type } : {};
        const categories = await prisma.category.findMany({
            where,
            orderBy: { name: "asc" },
        });

        res.json(categories);
    } catch (err) {
        console.error("Get categories error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if any transactions use this category
        const txCount = await prisma.transaction.count({
            where: { categoryId: parseInt(id) },
        });

        if (txCount > 0) {
            return res.status(400).json({
                msg: `Cannot delete: ${txCount} transaction(s) use this category`,
            });
        }

        await prisma.category.delete({
            where: { id: parseInt(id) },
        });

        res.json({ msg: "Category deleted" });
    } catch (err) {
        console.error("Delete category error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Seed default categories (idempotent — safe to call multiple times)
exports.seedCategories = async (req, res) => {
    try {
        let created = 0;

        for (const cat of DEFAULT_CATEGORIES) {
            const existing = await prisma.category.findFirst({
                where: { name: cat.name, type: cat.type },
            });
            if (!existing) {
                await prisma.category.create({ data: cat });
                created++;
            }
        }

        const all = await prisma.category.findMany({ orderBy: { name: "asc" } });

        res.status(201).json({
            msg: `Seeded ${created} new categories (${all.length} total)`,
            categories: all,
        });
    } catch (err) {
        console.error("Seed categories error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};
