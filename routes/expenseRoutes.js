import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true }, // Expect negative value
  date: { type: Date, default: Date.now }
});
const Expense = mongoose.model("Expense", expenseSchema);

router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newExpense = new Expense({ ...req.body, amount: -Math.abs(req.body.amount) }); // Ensure negative
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;