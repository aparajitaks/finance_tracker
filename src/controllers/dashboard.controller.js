const prisma = require("../config/prisma");

exports.getDashboard = async (req, res) => {
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
};