const prisma = require("../config/prisma");

exports.getMonthlyReport = async (req, res) => {
    try {
        const { year } = req.query;

        const where = { userId: req.userId };
        if (year) {
            where.date = {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${parseInt(year) + 1}-01-01`)
            };
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: { category: true },
            orderBy: { date: "asc" }
        });

        const months = {};

        transactions.forEach(t => {
            const key = t.date.toISOString().slice(0, 7);
            if (!months[key]) {
                months[key] = { month: key, income: 0, expense: 0, balance: 0, transactions: 0 };
            }
            if (t.type === "income") months[key].income += t.amount;
            else months[key].expense += t.amount;
            months[key].balance = months[key].income - months[key].expense;
            months[key].transactions++;
        });

        // Summary totals
        const totalIncome = Object.values(months).reduce((s, m) => s + m.income, 0);
        const totalExpense = Object.values(months).reduce((s, m) => s + m.expense, 0);

        res.json({
            summary: {
                totalIncome,
                totalExpense,
                savings: totalIncome - totalExpense,
                totalTransactions: transactions.length
            },
            monthly: Object.values(months)
        });
    } catch (err) {
        console.error("Monthly report error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getCategoryBreakdown = async (req, res) => {
    try {
        const { month } = req.query; // optional: ?month=2026-05

        const where = { userId: req.userId };
        if (month) {
            const start = new Date(`${month}-01`);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            where.date = { gte: start, lt: end };
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: { category: true }
        });

        const categories = {};
        transactions.forEach(t => {
            const key = `${t.category.name} (${t.category.type})`;
            if (!categories[key]) {
                categories[key] = { category: t.category.name, type: t.category.type, total: 0, count: 0 };
            }
            categories[key].total += t.amount;
            categories[key].count++;
        });

        res.json(Object.values(categories).sort((a, b) => b.total - a.total));
    } catch (err) {
        console.error("Category breakdown error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};
