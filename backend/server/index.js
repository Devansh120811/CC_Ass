import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const _dirname = path.resolve();
const buildpath = path.join(_dirname, "frontend", "dist");
app.use(express.static(buildpath));
app.use(cors({ credentials: true, origin:'http://localhost:5173' }));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect('mongodb+srv://devansh:HKX145TRsnjbgep6@cluster0.nqjahd3.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['deposit', 'withdraw'], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ","");
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, 'DEVANSH');
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log('Registering user:', { email, name });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // console.log(user);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ _id: user._id }, 'DEVANSH', { expiresIn: '1h' });
    // console.log('Generated token:', token);
    res.cookie('token', token, { httpOnly: true });
    res.json({ user: { id: user._id, email: user.email, name: user.name, Token:token } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Transaction Routes
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 });
      // console.log('Fetched transactions:', transactions);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      userId: req.user._id
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Analytics Routes
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: startDate }
    });

    const categoryTotals = transactions.reduce((acc, curr) => {
      const key = `${curr.category}-${curr.type}`;
      acc[key] = (acc[key] || 0) + curr.amount;
      return acc;
    }, {});

    const dailyTotals = transactions.reduce((acc, curr) => {
      const date = curr.date.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { deposits: 0, withdrawals: 0 };
      if (curr.type === 'deposit') {
        acc[date].deposits += curr.amount;
      } else {
        acc[date].withdrawals += curr.amount;
      }
      return acc;
    }, {});

    res.json({ categoryTotals, dailyTotals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});