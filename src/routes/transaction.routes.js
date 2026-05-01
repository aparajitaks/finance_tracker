const express = require("express");
const {
    createTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction,
} = require("../controllers/transaction.controller");

const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, createTransaction);
router.get("/", authMiddleware, getTransactions);
router.put("/:id", authMiddleware, updateTransaction);
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;