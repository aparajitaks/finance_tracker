const prisma = require("../config/prisma");

const VALID_TYPES = ["income", "expense"];

exports.createTransaction = async (req, res) => {
    try {
        const { amount, type, description, date, categoryId } = req.body;

        if (amount === undefined || amount === null) {
            return res.status(400).json({ msg: "amount is required" });
        }
        if (!type || !description || !date || !categoryId) {
            return res.status(400).json({
                msg: "All fields required: amount, type, description, date, categoryId",
            });
        }
        if (!VALID_TYPES.includes(type)) {
            return res.status(400).json({ msg: "type must be 'income' or 'expense'" });
        }

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

exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, description, date, categoryId } = req.body;

        // 1. Check existence
        const existing = await prisma.transaction.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existing) {
            return res.status(404).json({ msg: "Transaction not found" });
        }

        // 2. Check ownership
        if (existing.userId !== req.userId) {
            return res.status(403).json({ msg: "Not authorized to update this transaction" });
        }

        // 3. Validate type if provided
        if (type !== undefined && !VALID_TYPES.includes(type)) {
            return res.status(400).json({ msg: "type must be 'income' or 'expense'" });
        }

        // 4. Validate categoryId if provided
        if (categoryId !== undefined) {
            const category = await prisma.category.findUnique({
                where: { id: parseInt(categoryId) },
            });
            if (!category) {
                return res.status(404).json({ msg: "Category not found" });
            }
        }

        // 5. Build partial update data — only include provided fields
        const data = {};
        if (amount !== undefined) data.amount = parseFloat(amount);
        if (type !== undefined) data.type = type;
        if (description !== undefined) data.description = description;
        if (date !== undefined) data.date = new Date(date);
        if (categoryId !== undefined) data.categoryId = parseInt(categoryId);

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ msg: "No fields provided to update" });
        }

        const transaction = await prisma.transaction.update({
            where: { id: parseInt(id) },
            data,
        });

        res.json(transaction);
    } catch (err) {
        console.error("Update transaction error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check existence
        const existing = await prisma.transaction.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existing) {
            return res.status(404).json({ msg: "Transaction not found" });
        }

        // 2. Check ownership
        if (existing.userId !== req.userId) {
            return res.status(403).json({ msg: "Not authorized to delete this transaction" });
        }

        // 3. Delete
        await prisma.transaction.delete({
            where: { id: parseInt(id) },
        });

        res.json({ msg: "Transaction deleted" });
    } catch (err) {
        console.error("Delete transaction error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};