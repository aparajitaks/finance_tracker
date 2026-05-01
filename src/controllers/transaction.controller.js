const transactionService = require("../services/transaction.service");
const { successResponse } = require("../utils/response");

exports.createTransaction = async (req, res, next) => {
    try {
        const transaction = await transactionService.create(req.userId, req.body);
        successResponse(res, transaction, 201);
    } catch (err) {
        next(err);
    }
};

exports.getTransactions = async (req, res, next) => {
    try {
        const data = await transactionService.findAll(req.userId, req.query);
        successResponse(res, data);
    } catch (err) {
        next(err);
    }
};

exports.updateTransaction = async (req, res, next) => {
    try {
        const transaction = await transactionService.update(req.userId, req.params.id, req.body);
        successResponse(res, transaction);
    } catch (err) {
        next(err);
    }
};

exports.deleteTransaction = async (req, res, next) => {
    try {
        await transactionService.remove(req.userId, req.params.id);
        successResponse(res, { msg: "Transaction deleted" });
    } catch (err) {
        next(err);
    }
};