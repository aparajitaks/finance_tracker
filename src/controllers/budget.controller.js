const prisma = require("../config/prisma");

exports.setBudget = async (req, res) => {
    try {
        const { limit, categoryId, month } = req.body;

        // Fixed: !limit treats 0 as falsy — use explicit check
        if (limit === undefined || limit === null || !categoryId || !month) {
            return res.status(400).json({ msg: "limit, categoryId, and month (YYYY-MM) are required" });
        }

        if (parseFloat(limit) < 0) {
            return res.status(400).json({ msg: "limit must be 0 or greater" });
        }

        // Validate month format
        if (!/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({ msg: "month must be in YYYY-MM format" });
        }

        // Validate category exists
        const category = await prisma.category.findUnique({
            where: { id: parseInt(categoryId) }
        });
        if (!category) {
            return res.status(404).json({ msg: "Category not found" });
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

        // Fixed N+1: use aggregate instead of fetching full transaction records
        const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
            const monthStart = new Date(`${budget.month}-01`);
            const nextMonth = new Date(monthStart);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            const result = await prisma.transaction.aggregate({
                where: {
                    userId: req.userId,
                    categoryId: budget.categoryId,
                    date: { gte: monthStart, lt: nextMonth }
                },
                _sum: { amount: true }
            });

            const spent = result._sum.amount || 0;
            return {
                ...budget,
                spent,
                remaining: budget.limit - spent,
                exceeded: spent > budget.limit
            };
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

        // Check existence first
        const existing = await prisma.budget.findUnique({
            where: { id: parseInt(id) }
        });
        if (!existing) {
            return res.status(404).json({ msg: "Budget not found" });
        }

        // Check ownership
        if (existing.userId !== req.userId) {
            return res.status(403).json({ msg: "Not authorized to delete this budget" });
        }

        await prisma.budget.delete({
            where: { id: parseInt(id) }
        });

        res.json({ msg: "Budget deleted" });
    } catch (err) {
        console.error("Delete budget error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};
