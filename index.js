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
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/transactions", transactionRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/budgets", budgetRoutes);
app.use("/profile", profileRoutes);
app.use("/reports", reportRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});