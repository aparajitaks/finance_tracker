const express = require("express");
const { getDashboard } = require("../controllers/dashboard.controller");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, getDashboard);

module.exports = router;