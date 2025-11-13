import axios from "axios";

const API_BASE = "http://localhost:4000/api"; // Backend URL

export const getIncome = async () => axios.get(`${API_BASE}/income`);
export const addIncome = async (data) => axios.post(`${API_BASE}/income`, data);

export const getExpense = async () => axios.get(`${API_BASE}/expense`);
export const addExpense = async (data) => axios.post(`${API_BASE}/expense`, data);
