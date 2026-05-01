const prisma = require("../config/prisma");

exports.getDashboard = async (req, res, next) => {
    try {
        const [incomeResult, expenseResult, categorySpending] = await Promise.all([
            prisma.transaction.aggregate({
                where: { userId: req.userId, type: "income" },
                _sum: { amount: true }
            }),
            prisma.transaction.aggregate({
                where: { userId: req.userId, type: "expense" },
                _sum: { amount: true }
            }),
            prisma.transaction.groupBy({
                by: ['categoryId'],
                where: { userId: req.userId, type: "expense" },
                _sum: { amount: true },
                orderBy: { _sum: { amount: 'desc' } }
            })
        ]);

        const totalIncome = incomeResult._sum.amount ? parseFloat(incomeResult._sum.amount) : 0;
        const totalExpense = expenseResult._sum.amount ? parseFloat(expenseResult._sum.amount) : 0;
        const savings = totalIncome - totalExpense;

        // Fetch category names for the grouped data
        const categoryIds = categorySpending.map(c => c.categoryId);
        const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
        const categoryMap = categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.name }), {});

        const analytics = categorySpending.map(c => ({
            category: categoryMap[c.categoryId] || 'Unknown',
            amount: c._sum.amount ? parseFloat(c._sum.amount) : 0
        }));

        res.json({ totalIncome, totalExpense, savings, categoryAnalytics: analytics });
    } catch (err) {
        next(err);
    }
};

exports.getMonthlyReport = async (req, res, next) => {
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
            const amount = parseFloat(t.amount);
            if (t.type === "income") report[month].income += amount;
            else report[month].expense += amount;
            report[month].balance = report[month].income - report[month].expense;
        });

        res.json(report);
    } catch (err) {
        next(err);
    }
};