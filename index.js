import express from "express";
import transactionRoutes from "./src/routes/transaction.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";

const app = express();
app.use(express.json());

app.use("/transactions", transactionRoutes);
app.use("/dashboard", dashboardRoutes);

app.listen(3000, () => console.log("Server running"));