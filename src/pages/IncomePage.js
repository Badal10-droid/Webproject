import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Income() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Room'); // Default to Room
  const [customerName, setCustomerName] = useState('');
  const [lineItems, setLineItems] = useState([{ item: '', quantity: 1, price: 0 }]); // Dynamic items
  const [description, setDescription] = useState('');
  const [bills, setBills] = useState([]); // Past bills list
  const [loading, setLoading] = useState(false);

  // Load past bills on mount
  React.useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get('/api/income');
      setBills(res.data);
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { item: '', quantity: 1, price: 0 }]);
  };

  const removeLineItem = (index) => {
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);
  };

  const updateLineItem = (index, field, value) => {
    const updated = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(updated);
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalAmount <= 0) return alert('Add at least one item!');
    
    setLoading(true);
    try {
      await axios.post('/api/income', {
        category,
        customerName,
        lineItems,
        description,
        amount: totalAmount // For legacy compatibility
      });
      alert(`Bill generated for ${customerName}! Total: $${totalAmount}`);
      fetchBills(); // Refresh list
      navigate('/?refetch=true'); // Update Dashboard
    } catch (err) {
      alert('Error saving bill: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Generate Income Bill</h2>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <label>Customer Name:</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g., John Doe"
          required
          style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
        />

        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}>
          <option value="Room">Room Booking</option>
          <option value="Food">Food & Dining</option>
          <option value="Service">Services (Spa, etc.)</option>
          <option style={{ backgroundColor: '#e6f3ff', fontWeight: 'bold' }} value="Fish Farm">🐟 Fish Farm Special (Fresh Catch)</option>
        </select>

        <label>Description/Notes:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Deluxe room for 2 nights"
          style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%', height: '60px' }}
        />

        <h4>Line Items</h4>
        {lineItems.map((item, index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
            <input
              type="text"
              placeholder="Item (e.g., Grilled Trout for Fish Farm)"
              value={item.item}
              onChange={(e) => updateLineItem(index, 'item', e.target.value)}
              style={{ marginRight: '10px', padding: '5px' }}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value))}
              min="1"
              style={{ marginRight: '10px', padding: '5px', width: '80px' }}
              required
            />
            <input
              type="number"
              placeholder="Price per unit"
              value={item.price}
              onChange={(e) => updateLineItem(index, 'price', parseFloat(e.target.value))}
              min="0"
              step="0.01"
              style={{ marginRight: '10px', padding: '5px', width: '100px' }}
              required
            />
            <button type="button" onClick={() => removeLineItem(index)} style={{ padding: '5px 10px', background: '#dc3545', color: 'white' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addLineItem} style={{ padding: '8px 16px', background: '#007bff', color: 'white' }}>Add Item</button>

        <div style={{ margin: '20px 0', fontSize: '18px', fontWeight: 'bold', textAlign: 'right' }}>
          Total Bill: ${totalAmount.toLocaleString()}
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#28a745', color: 'white' }}>
          {loading ? 'Generating...' : 'Generate & Save Bill'}
        </button>
      </form>

      <h3>Past Bills (Records)</h3>
      {bills.length === 0 ? (
        <p>No bills yet. Generate one above!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {bills.slice(0, 10).map((bill) => ( // Show last 10
            <li key={bill._id || bill.id} style={{ border: '1px solid #eee', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
              <strong>{bill.customerName || 'Customer'}</strong> - {bill.category || 'General'} Bill (Date: {new Date(bill.date).toLocaleDateString()})
              <br />
              Total: ${(bill.totalAmount || bill.amount || 0).toLocaleString()} | 
              {bill.lineItems ? (
                <span>Items: {bill.lineItems.map(li => `${li.quantity}x ${li.item} (@$${li.price})`).join(', ')}</span>
              ) : (
                <span>Description: {bill.description || 'N/A'}</span>
              )}
              <br />
              <small>{bill.description || bill.lineItems ? 'See items above' : ''}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}