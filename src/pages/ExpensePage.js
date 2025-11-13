import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Expense() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Staff Salary'); // Default to common resort expense
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [expenses, setExpenses] = useState([]); // Past expenses list
  const [loading, setLoading] = useState(false);

  // Load past expenses on mount
  React.useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/expense');
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return alert('Enter a valid amount!');
    
    setLoading(true);
    try {
      await axios.post('/api/expense', { 
        category, 
        description, 
        amount: -parseFloat(amount), // Negative for expense
        date: date || new Date().toISOString().split('T')[0] // Default to today
      });
      alert(`Expense added: ${category} - $${amount}`);
      fetchExpenses(); // Refresh list
      navigate('/?refetch=true'); // Update Dashboard
    } catch (err) {
      alert('Error adding expense: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Add Resort Expense</h2>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <label>Category (Standard Resort Expenses):</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}>
          <option value="Staff Salary">Staff Salary</option>
          <option value="Electricity Bill">Electricity and Water Bill</option>
          <option value="Maintenance">Maintenance & Repairs</option>
          <option value="Supplies">Supplies & Inventory</option>
          <option value="Marketing">Marketing & Advertising</option>
          <option value="Utilities">Other Utilities</option>
          <option value="Food Supplies">Food Supplies</option>
          <option value="Fish Farm Maintenance">Fish Farm Maintenance</option>
          <option value="Other">Other</option>
        </select>

        <label>Description/Notes:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Monthly electricity for main building"
          style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%', height: '60px' }}
        />

        <label>Amount ($):</label>
        <input
          type="number"
          placeholder="e.g., 2500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
          required
          style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
        />

        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
        />

        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#dc3545', color: 'white' }}>
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>

      <h3>Past Expenses (Records)</h3>
      {expenses.length === 0 ? (
        <p>No expenses yet. Add one above!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {expenses.slice(0, 10).map((expense) => ( // Show last 10
            <li key={expense._id || expense.id} style={{ border: '1px solid #eee', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
              <strong>{expense.category || 'General'}</strong> - {expense.description || 'N/A'} (Date: {new Date(expense.date).toLocaleDateString()})
              <br />
              Amount: ${Math.abs(expense.amount || 0).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}