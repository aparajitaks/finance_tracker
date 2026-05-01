require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const logger = require("./src/utils/logger");

const app = express();

const authRoutes = require("./src/routes/auth.routes");
const categoryRoutes = require("./src/routes/category.routes");
const transactionRoutes = require("./src/routes/transaction.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const budgetRoutes = require("./src/routes/budget.routes");
const profileRoutes = require("./src/routes/profile.routes");
const reportRoutes = require("./src/routes/report.routes");

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting on Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: "Too many login attempts, please try again later"
});
app.use("/auth", authLimiter);

// Static files
const publicDir = path.resolve(__dirname, "public");
app.use(express.static(publicDir));

// API routes
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/transactions", transactionRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/budgets", budgetRoutes);
app.use("/profile", profileRoutes);
app.use("/reports", reportRoutes);

// Serve frontend ONLY for GET /
app.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, msg: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error("Unhandled error:", err);
    const status = err.status || 500;
    const msg = status === 500 ? "Internal server error" : err.message;
    res.status(status).json({ success: false, msg });
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
}

module.exports = app;