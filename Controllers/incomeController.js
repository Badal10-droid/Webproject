// controllers/incomeController.js

export const getIncome = (req, res) => {
  res.json({ message: "Get all income data" });
};

export const addIncome = (req, res) => {
  const newIncome = req.body;
  res.json({ message: "Income added", data: newIncome });
};
