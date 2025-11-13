import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Expense", expenseSchema);
