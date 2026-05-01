import express from "express";
import {
    createTransaction,
    getTransactions,
    deleteTransaction,
} from "../controllers/transaction.controller.js";

import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createTransaction);
router.get("/", authMiddleware, getTransactions);
router.delete("/:id", authMiddleware, deleteTransaction);

export default router;