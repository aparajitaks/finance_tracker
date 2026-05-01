const express = require("express");
const {
    createTransaction,
    getTransactions,
    deleteTransaction,
} = require("../controllers/transaction.controller");

const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, createTransaction);
router.get("/", authMiddleware, getTransactions);
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;