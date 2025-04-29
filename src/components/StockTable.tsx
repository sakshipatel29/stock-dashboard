import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface StockData {
  symbol: string;
  price: number;
  changePercent: number;
}

const STOCKS = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'META',
  'NFLX', 
  'PEP',
  'KO',
  'WMT', 
  'BA'
];


const API_KEY = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_TWELVE_DATA_API_KEY_PROD
  : process.env.REACT_APP_TWELVE_DATA_API_KEY_DEV;

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
        const res = await axios.get(`https://api.twelvedata.com/quote`, {
          params: {
            symbol: symbol,
            apikey: API_KEY,
          },
        });
  
        const data = res.data;
  
        if (!data || data.status === "error") {
          console.warn(`No data for symbol: ${symbol}`);
          continue;
        }
  
        fetchedData.push({
          symbol: symbol,
          price: data.price ? parseFloat(data.price) : (data.close ? parseFloat(data.close) : 0),
          changePercent: parseFloat(data.percent_change),
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
  
      setStocks(fetchedData);
    } catch (err: any) {
      console.error('Fetch error:', err.response?.data || err.message || err);
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
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 pt-12 px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 flex items-center gap-2">
        <span role="img" aria-label="chart">📈</span>
        <span className="text-gray-800">Stock Price Dashboard</span>
      </h1>
  
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder="Search stock..."
            className="border border-gray-300 rounded-md px-4 py-2 w-full sm:w-1/2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap justify-center gap-2">
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
              Sort by Change
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              onClick={fetchStockData}
              aria-label="Refresh"
            >
              <span className={`${loading ? 'animate-spin' : ''}`}>↻</span>
            </button>
          </div>
        </div>
  
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-4 px-6">Symbol</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => (
                <tr key={stock.symbol} className="border-t hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold">{stock.symbol}</td>
                  <td className="py-4 px-6">${stock.price.toFixed(2)}</td>
                  <td className={`py-4 px-6 ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.changePercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  
  
};

export default StockTable;
