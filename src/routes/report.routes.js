const express = require("express");
const { getMonthlyReport, getCategoryBreakdown } = require("../controllers/report.controller");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/monthly", authMiddleware, getMonthlyReport);
router.get("/categories", authMiddleware, getCategoryBreakdown);

module.exports = router;
