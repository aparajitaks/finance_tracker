const prisma = require("../config/prisma");

exports.createTransaction = async (req, res) => {
    const { amount, type, description, date, categoryId } = req.body;

    const transaction = await prisma.transaction.create({
        data: {
            amount,
            type,
            description,
            date: new Date(date),
            categoryId,
            userId: req.userId,
        },
    });

    res.json(transaction);
};

exports.getTransactions = async (req, res) => {
    const transactions = await prisma.transaction.findMany({
        where: { userId: req.userId },
        include: { category: true },
        orderBy: { date: "desc" },
    });

    res.json(transactions);
};

exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;

    await prisma.transaction.delete({
        where: {
            id: parseInt(id),
            userId: req.userId,
        },
    });

    res.json({ msg: "Transaction deleted" });
};