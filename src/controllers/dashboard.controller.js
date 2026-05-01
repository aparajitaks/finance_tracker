const prisma = require("../config/prisma");

exports.getDashboard = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
        });

        let income = 0;
        let expense = 0;

        transactions.forEach((t) => {
            if (t.type === "income") income += t.amount;
            else expense += t.amount;
        });

        const savings = income - expense;

        res.json({
            totalIncome: income,
            totalExpense: expense,
            savings,
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
            orderBy: { date: 'asc' }
        });

        const report = {};

        transactions.forEach(t => {
            const month = t.date.toISOString().slice(0, 7); // YYYY-MM
            if (!report[month]) {
                report[month] = { income: 0, expense: 0, balance: 0 };
            }
            if (t.type === 'income') report[month].income += t.amount;
            else report[month].expense += t.amount;
            report[month].balance = report[month].income - report[month].expense;
        });

        res.json(report);
    } catch (err) {
        console.error("Monthly report error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};