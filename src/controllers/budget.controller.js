const prisma = require("../config/prisma");

exports.setBudget = async (req, res) => {
    try {
        const { limit, categoryId, month } = req.body;

        if (!limit || !categoryId || !month) {
            return res.status(400).json({ msg: "limit, categoryId, and month (YYYY-MM) are required" });
        }

        const budget = await prisma.budget.upsert({
            where: {
                userId_categoryId_month: {
                    userId: req.userId,
                    categoryId: parseInt(categoryId),
                    month
                }
            },
            update: { limit: parseFloat(limit) },
            create: {
                limit: parseFloat(limit),
                month,
                categoryId: parseInt(categoryId),
                userId: req.userId
            }
        });

        res.status(201).json(budget);
    } catch (err) {
        console.error("Set budget error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getBudgets = async (req, res) => {
    try {
        const { month } = req.query;

        const budgets = await prisma.budget.findMany({
            where: { 
                userId: req.userId,
                ...(month && { month })
            },
            include: { category: true }
        });

        // Calculate spent for each budget
        const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
            const transactions = await prisma.transaction.findMany({
                where: {
                    userId: req.userId,
                    categoryId: budget.categoryId,
                    date: {
                        gte: new Date(`${budget.month}-01`),
                        lt: new Date(new Date(`${budget.month}-01`).setMonth(new Date(`${budget.month}-01`).getMonth() + 1))
                    }
                }
            });

            const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
            return { ...budget, spent, remaining: budget.limit - spent };
        }));

        res.json(budgetsWithSpending);
    } catch (err) {
        console.error("Get budgets error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.budget.delete({
            where: { id: parseInt(id), userId: req.userId }
        });
        res.json({ msg: "Budget deleted" });
    } catch (err) {
        console.error("Delete budget error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};
