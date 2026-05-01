const express = require("express");
const { getDashboard, getMonthlyReport } = require("../controllers/dashboard.controller");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, getDashboard);
router.get("/report", authMiddleware, getMonthlyReport);

module.exports = router;