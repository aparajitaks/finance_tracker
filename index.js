require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./src/routes/auth.routes");
const transactionRoutes = require("./src/routes/transaction.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/dashboard", dashboardRoutes);
app.get("/", (req, res) => {
    res.send("API running");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});