import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Define models inline (or import from models/ if you have them)
const incomeSchema = new mongoose.Schema({
  category: { type: String, required: true, enum: ['Food', 'Service', 'Room', 'Fish Farm'] }, // Updated for bill categories
  customerName: { type: String, required: true },
  lineItems: [{
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true }, // Updated to totalAmount for bills
  date: { type: Date, default: Date.now },
  description: { type: String }
});
const Income = mongoose.models.Income || mongoose.model("Income", incomeSchema);

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true }, // Negative for expenses
  date: { type: Date, default: Date.now },
  category: { type: String } // Added for breakdown compatibility
});
const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

// GET /metrics - Aggregates totals
router.get("/metrics", async (req, res) => {
  try {
    const totalRevenue = await Income.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
    const totalExpensesAgg = await Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const totalExpenses = Math.abs(totalExpensesAgg[0]?.total || 0); // Make positive for display
    const netProfit = (totalRevenue[0]?.total || 0) - totalExpenses;

    // Added category breakdown
    const categoryRevenue = await Income.aggregate([
      { $group: { _id: "$category", revenue: { $sum: "$totalAmount" } } },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalExpenses,
      netProfit,
      occupancyRate: 78, // Placeholder
      categoryBreakdown: categoryRevenue // e.g., [{ _id: 'Fish Farm', revenue: 500 }]
    });
  } catch (err) {
    console.error("Metrics error:", err); // Log for debugging
    res.status(500).json({ error: err.message });
  }
});

// GET /transactions - Combined recent
router.get("/transactions", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const incomes = await Income.find().sort({ date: -1 }).limit(limit).lean();
    const expenses = await Expense.find().sort({ date: -1 }).limit(limit).lean();
    
    const transactions = [
      ...incomes.map(i => ({ ...i, type: "Income", amount: i.totalAmount })), // Map totalAmount to amount for compatibility
      ...expenses.map(e => ({ ...e, type: "Expense" }))
    ];
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(transactions.slice(0, limit));
  } catch (err) {
    console.error("Transactions error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /revenue-trend (monthly)
router.get("/revenue-trend", async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: { $dateToString: { format: "%b", date: "$date" } }, revenue: { $sum: "$totalAmount" } } }, // Updated to totalAmount
      { $sort: { _id: 1 } },
      { $limit: 5 }
    ];
    const trends = await Income.aggregate(pipeline);
    res.json(trends.map(t => ({ month: t._id, revenue: t.revenue })));
  } catch (err) {
    console.error("Revenue trend error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /expenses-breakdown (by category; add 'category' field to Expense if needed)
router.get("/expenses-breakdown", async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: "$category", amount: { $sum: { $abs: "$amount" } } } },
      { $sort: { amount: -1 } },
      { $limit: 5 }
    ];
    const breakdown = await Expense.aggregate(pipeline);
    res.json(breakdown.length > 0 ? breakdown : [
      { category: 'Staff', amount: 30000 },
      { category: 'Utilities', amount: 15000 },
      { category: 'Maintenance', amount: 12000 },
      { category: 'Supplies', amount: 18000 },
      { category: 'Marketing', amount: 10000 }
    ]); // Fallback if no data
  } catch (err) {
    console.error("Expenses breakdown error:", err);
    res.status(500).json({ error: err.message });
  }
});
// GET /daily-summary - Today's income/expense summary
router.get("/daily-summary", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    // Today's income sum (from totalAmount)
    const todayIncome = await Income.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, totalIncome: { $sum: "$totalAmount" } } }
    ]);

    // Today's expense sum (absolute value)
    const todayExpensesAgg = await Expense.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, totalExpenses: { $sum: "$amount" } } }
    ]);
    const todayExpenses = Math.abs(todayExpensesAgg[0]?.totalExpenses || 0);

    const todayRevenue = (todayIncome[0]?.totalIncome || 0) - todayExpenses;

    res.json({
      todayIncome: todayIncome[0]?.totalIncome || 0,
      todayExpenses,
      todayRevenue
    });
  } catch (err) {
    console.error("Daily summary error:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;