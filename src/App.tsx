import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Search } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function App() {
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({ totalSale: 0, soldItems: 0, notSoldItems: 0 });
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedMonth, searchText, page]);

  const fetchData = async () => {
    try {
      const [transactionsRes, statsRes, barRes, pieRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/transactions?month=${selectedMonth}&search=${searchText}&page=${page}`),
        axios.get(`http://localhost:3000/api/statistics?month=${selectedMonth}`),
        axios.get(`http://localhost:3000/api/bar-chart?month=${selectedMonth}`),
        axios.get(`http://localhost:3000/api/pie-chart?month=${selectedMonth}`)
      ]);

      setTransactions(transactionsRes.data.transactions);
      setTotalPages(transactionsRes.data.totalPages);
      setStatistics(statsRes.data);
      setBarChartData(barRes.data);
      setPieChartData(pieRes.data);
      setError('');
    } catch (err) {
      // Safe error handling that avoids cloning issues
      setError('Failed to fetch data. Please try again later.');
      
      // Reset states to prevent stale data display
      setTransactions([]);
      setTotalPages(1);
      setStatistics({ totalSale: 0, soldItems: 0, notSoldItems: 0 });
      setBarChartData([]);
      setPieChartData([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Transaction Dashboard</h1>
        
        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex gap-4 items-center">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border rounded"
            >
              {MONTHS.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 p-2 border rounded w-full"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Sale</h3>
            <p className="text-2xl">${statistics.totalSale.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Sold Items</h3>
            <p className="text-2xl">{statistics.soldItems}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Not Sold Items</h3>
            <p className="text-2xl">{statistics.notSoldItems}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Price Range Distribution</h3>
            <BarChart width={500} height={300} data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Categories Distribution</h3>
            <PieChart width={500} height={300}>
              <Pie
                data={pieChartData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.id}</td>
                  <td className="px-6 py-4">{transaction.title}</td>
                  <td className="px-6 py-4">{transaction.description}</td>
                  <td className="px-6 py-4">${transaction.price}</td>
                  <td className="px-6 py-4">{transaction.category}</td>
                  <td className="px-6 py-4">{transaction.sold ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4">{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;