import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allow frontend origin
  credentials: true
}));
app.use(express.json());

// Routes
import incomeRoutes from "./routes/incomeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

app.use("/api/income", incomeRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api", dashboardRoutes);

// Add a basic health check route for testing
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running!" });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit if DB fails
  }
};

// Connect to DB then start server
connectDB().then(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});