import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
  source: String,
  amount: Number,
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Income", incomeSchema);