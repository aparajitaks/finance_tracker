import prisma from "../config/prisma.js";

export const createTransaction = async (req, res) => {
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

export const getTransactions = async (req, res) => {
    const transactions = await prisma.transaction.findMany({
        where: { userId: req.userId },
        include: { category: true },
    });

    res.json(transactions);
};

export const deleteTransaction = async (req, res) => {
    const { id } = req.params;

    await prisma.transaction.delete({
        where: { id: Number(id) },
    });

    res.json({ msg: "Deleted" });
};