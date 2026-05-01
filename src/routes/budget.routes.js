const express = require("express");
const { setBudget, getBudgets, deleteBudget } = require("../controllers/budget.controller");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, setBudget);
router.get("/", authMiddleware, getBudgets);
router.delete("/:id", authMiddleware, deleteBudget);

module.exports = router;
