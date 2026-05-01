const express = require("express");
const {
    createTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction,
} = require("../controllers/transaction.controller");

const { authMiddleware } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { createTransactionSchema, updateTransactionSchema } = require("../validators/transaction.validator");

const router = express.Router();

router.post("/", authMiddleware, validate(createTransactionSchema), createTransaction);
router.get("/", authMiddleware, getTransactions);
router.put("/:id", authMiddleware, validate(updateTransactionSchema), updateTransaction);
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;