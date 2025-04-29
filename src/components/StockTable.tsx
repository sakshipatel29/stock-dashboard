import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface StockData {
  symbol: string;
  price: number;
  changePercent: number;
}

const STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

const StockTable: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price' | 'changePercent' | null>(null);

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedData: StockData[] = [];

      for (const symbol of STOCKS) {
        const res = await axios.get(`https://www.alphavantage.co/query`, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: API_KEY,
          },
        });

        const data = res.data['Global Quote'];

        if (!data || Object.keys(data).length === 0) {
          throw new Error(`No data for symbol: ${symbol}`);
        }

        fetchedData.push({
          symbol,
          price: parseFloat(data['05. price']),
          changePercent: parseFloat(data['10. change percent'].replace('%', '')),
        });
      }

      setStocks(fetchedData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const filteredStocks = stocks
    .filter((stock) => stock.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'changePercent') return b.changePercent - a.changePercent;
      return 0;
    });

  if (loading) return <div className="text-center py-10">Loading stock data...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto p-4 space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Search stock..."
          className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={() => setSortBy('price')}
          >
            Sort by Price
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            onClick={() => setSortBy('changePercent')}
          >
            Sort by Change %
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            onClick={fetchStockData}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-6 text-left">Symbol</th>
            <th className="py-3 px-6 text-left">Price</th>
            <th className="py-3 px-6 text-left">Change %</th>
          </tr>
        </thead>
        <tbody>
          {filteredStocks.map((stock) => (
            <tr key={stock.symbol} className="border-b hover:bg-gray-50">
              <td className="py-3 px-6">{stock.symbol}</td>
              <td className="py-3 px-6">${stock.price.toFixed(2)}</td>
              <td className={`py-3 px-6 ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.changePercent.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
