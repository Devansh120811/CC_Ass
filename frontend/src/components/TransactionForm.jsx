import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch,useSelector } from 'react-redux';
import { triggerRefresh } from '../redux/analyticsSlice'; // adjust path if needed

export function TransactionForm({ onTransactionAdded, availableBalance }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('deposit');
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (type === 'withdraw' && numericAmount > availableBalance) {
      toast.error('Insufficient balance for withdrawal ❌');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: numericAmount,
          description,
          type,
          category,
        }),
      });

      if (!response.ok) throw new Error('Failed to add transaction');

      setAmount('');
      setDescription('');
      setCategory('other');
      toast.success('Transaction added successfully!');
      onTransactionAdded?.();

      // ✅ Trigger analytics refresh
      dispatch(triggerRefresh());
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bills">Bills</option>
            <option value="groceries">Groceries</option>
            <option value="salary">Salary</option>
            <option value="entertainment">Entertainment</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
      >
        <PlusCircle size={20} />
        {loading ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
}
