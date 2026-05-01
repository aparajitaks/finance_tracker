require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const authRoutes = require("./src/routes/auth.routes");
const categoryRoutes = require("./src/routes/category.routes");
const transactionRoutes = require("./src/routes/transaction.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const budgetRoutes = require("./src/routes/budget.routes");
const profileRoutes = require("./src/routes/profile.routes");
const reportRoutes = require("./src/routes/report.routes");

app.use(cors());
app.use(express.json());

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

// Serve frontend ONLY for GET / (not for API-like paths)
app.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

// 404 handler — return JSON, never HTML
app.use((req, res) => {
    res.status(404).json({ success: false, msg: `Route ${req.method} ${req.path} not found` });
});

// Global error handler — always JSON
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({ success: false, msg: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});