const prisma = require("../config/prisma");

exports.createTransaction = async (req, res) => {
    try {
        const { amount, type, description, date, categoryId } = req.body;

        if (!amount || !type || !description || !date || !categoryId) {
            return res.status(400).json({
                msg: "All fields required: amount, type, description, date, categoryId",
            });
        }

        // Validate category exists before inserting
        const category = await prisma.category.findUnique({
            where: { id: parseInt(categoryId) },
        });
        if (!category) {
            return res.status(404).json({
                msg: `Category with id ${categoryId} not found. Seed categories first: POST /categories/seed`,
            });
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type,
                description,
                date: new Date(date),
                categoryId: parseInt(categoryId),
                userId: req.userId,
            },
        });

        res.status(201).json(transaction);
    } catch (err) {
        console.error("Create transaction error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
            include: { category: true },
            orderBy: { date: "desc" },
        });

        res.json(transactions);
    } catch (err) {
        console.error("Get transactions error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.transaction.delete({
            where: {
                id: parseInt(id),
                userId: req.userId,
            },
        });

        res.json({ msg: "Transaction deleted" });
    } catch (err) {
        console.error("Delete transaction error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};