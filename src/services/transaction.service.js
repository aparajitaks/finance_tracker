const prisma = require("../config/prisma");

exports.create = async (userId, data) => {
    // We assume data is validated by Zod at this point
    const { amount, type, description, date, categoryId } = data;

    const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
    });
    
    if (!category) {
        const error = new Error(`Category with id ${categoryId} not found.`);
        error.status = 404;
        throw error;
    }

    return prisma.transaction.create({
        data: {
            amount: parseFloat(amount),
            type,
            description,
            date: new Date(date),
            categoryId: parseInt(categoryId),
            userId,
        },
    });
};

exports.findAll = async (userId, filters = {}) => {
    const { page = 1, limit = 20, type, categoryId, startDate, endDate } = filters;

    const where = { userId };
    if (type) where.type = type;
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: { category: true },
            orderBy: { date: "desc" },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        }),
        prisma.transaction.count({ where })
    ]);

    return {
        transactions,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        }
    };
};

exports.update = async (userId, id, data) => {
    const existing = await prisma.transaction.findUnique({
        where: { id: parseInt(id) },
    });
    
    if (!existing) {
        const error = new Error("Transaction not found");
        error.status = 404;
        throw error;
    }

    if (existing.userId !== userId) {
        const error = new Error("Not authorized to update this transaction");
        error.status = 403;
        throw error;
    }

    if (data.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: parseInt(data.categoryId) },
        });
        if (!category) {
            const error = new Error("Category not found");
            error.status = 404;
            throw error;
        }
    }

    return prisma.transaction.update({
        where: { id: parseInt(id) },
        data,
    });
};

exports.remove = async (userId, id) => {
    const existing = await prisma.transaction.findUnique({
        where: { id: parseInt(id) },
    });
    
    if (!existing) {
        const error = new Error("Transaction not found");
        error.status = 404;
        throw error;
    }

    if (existing.userId !== userId) {
        const error = new Error("Not authorized to delete this transaction");
        error.status = 403;
        throw error;
    }

    await prisma.transaction.delete({
        where: { id: parseInt(id) },
    });
};
