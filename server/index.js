import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Transaction from './models/Transaction.js';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transactions');

// Initialize database
app.post('/api/initialize', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    await Transaction.deleteMany({});
    await Transaction.insertMany(response.data);
    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List transactions with search and pagination
app.get('/api/transactions', async (req, res) => {
  try {
    const { month, search = '', page = 1, perPage = 10 } = req.query;
    const monthNumber = new Date(Date.parse(month + " 1, 2000")).getMonth() + 1;
    
    let query = {
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber]
      }
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: isNaN(search) ? undefined : Number(search) }
      ].filter(Boolean);
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.json({
      transactions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / perPage)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = new Date(Date.parse(month + " 1, 2000")).getMonth() + 1;

    const query = {
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber]
      }
    };

    const [totalSale] = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const soldItems = await Transaction.countDocuments({ ...query, sold: true });
    const notSoldItems = await Transaction.countDocuments({ ...query, sold: false });

    res.json({
      totalSale: totalSale?.total || 0,
      soldItems,
      notSoldItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bar chart data
app.get('/api/bar-chart', async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = new Date(Date.parse(month + " 1, 2000")).getMonth() + 1;

    const ranges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity }
    ];

    const result = await Promise.all(
      ranges.map(async ({ min, max }) => {
        const count = await Transaction.countDocuments({
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthNumber]
          },
          price: { $gte: min, $lt: max === Infinity ? 1000000 : max }
        });
        return {
          range: `${min}-${max === Infinity ? 'above' : max}`,
          count
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pie chart data
app.get('/api/pie-chart', async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = new Date(Date.parse(month + " 1, 2000")).getMonth() + 1;

    const result = await Transaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthNumber]
          }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(result.map(item => ({
      category: item._id,
      count: item.count
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Combined data
app.get('/api/combined-data', async (req, res) => {
  try {
    const { month } = req.query;
    
    const [statistics, barChart, pieChart] = await Promise.all([
      axios.get(`http://localhost:3000/api/statistics?month=${month}`),
      axios.get(`http://localhost:3000/api/bar-chart?month=${month}`),
      axios.get(`http://localhost:3000/api/pie-chart?month=${month}`)
    ]);

    res.json({
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});