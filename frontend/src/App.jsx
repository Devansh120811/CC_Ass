import React, { useEffect, useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Analytics } from './components/Analytics';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUserFromStorage } from './redux/authSlice';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const dispatch = useDispatch();
  const { user, tokenExpiry,token } = useSelector((state) => state.auth);
  // console.log('User:', user);
  useEffect(() => {
    dispatch(setUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      dispatch(logout());
    }
  }, [tokenExpiry, dispatch]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log('Response:', response);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      dispatch(logout());
      setView('login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalBalance = filteredTransactions.reduce((acc, curr) => {
    return curr.type === 'deposit' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          {view === 'login' ? (
            <Login onRegisterClick={() => setView('register')} />
          ) : (
            <Register onRegister={() => setView('login')} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="text-blue-600" />
              Transaction Manager
            </h1>
            <p className="text-gray-600">Welcome, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalBalance.toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Logout"
            >
              <LogOut />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TransactionForm
              onTransactionAdded={fetchTransactions}
              availableBalance={totalBalance}
            />

            <div className="mt-6 mb-4 flex gap-4">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="bills">Bills</option>
                <option value="groceries">Groceries</option>
                <option value="salary">Salary</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow-md">
                <p className="text-gray-600">No transactions found</p>
              </div>
            ) : (
              <TransactionList transactions={filteredTransactions} />
            )}
          </div>

          <div className="lg:col-span-1">
            <Analytics userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
