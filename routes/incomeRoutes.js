import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const incomeSchema = new mongoose.Schema({
  category: { type: String, required: true, enum: ['Food', 'Service', 'Room', 'Fish Farm'] }, // Categories
  customerName: { type: String, required: true },
  lineItems: [{
    item: { type: String, required: true }, // e.g., "Grilled Trout" or "Deluxe Room"
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true }, // Auto-calculated
  date: { type: Date, default: Date.now },
  description: { type: String } // Optional note
});
const Income = mongoose.models.Income || mongoose.model("Income", incomeSchema);

// GET all incomes (now bills)
router.get("/", async (req, res) => {
  try {
    const incomes = await Income.find().sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new bill (income)
router.post("/", async (req, res) => {
  try {
    const { category, customerName, lineItems, description } = req.body;
    const totalAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    const newIncome = new Income({
      category,
      customerName,
      lineItems,
      totalAmount,
      description
    });
    await newIncome.save();
    res.status(201).json(newIncome);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;