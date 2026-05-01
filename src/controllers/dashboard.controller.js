const prisma = require("../config/prisma");

exports.getDashboard = async (req, res) => {
    try {
        // Use aggregate instead of fetching all records into memory
        const [incomeResult, expenseResult] = await Promise.all([
            prisma.transaction.aggregate({
                where: { userId: req.userId, type: "income" },
                _sum: { amount: true }
            }),
            prisma.transaction.aggregate({
                where: { userId: req.userId, type: "expense" },
                _sum: { amount: true }
            })
        ]);

        const totalIncome = incomeResult._sum.amount || 0;
        const totalExpense = expenseResult._sum.amount || 0;
        const savings = totalIncome - totalExpense;

        res.json({ totalIncome, totalExpense, savings });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
            orderBy: { date: "asc" }
        });

        const report = {};

        transactions.forEach(t => {
            const month = t.date.toISOString().slice(0, 7);
            if (!report[month]) {
                report[month] = { income: 0, expense: 0, balance: 0 };
            }
            if (t.type === "income") report[month].income += t.amount;
            else report[month].expense += t.amount;
            report[month].balance = report[month].income - report[month].expense;
        });

        res.json(report);
    } catch (err) {
        console.error("Monthly report error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};