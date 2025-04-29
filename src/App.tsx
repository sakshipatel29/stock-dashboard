import StockTable from './components/StockTable';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">📈 Stock Price Dashboard</h1>
        <StockTable />
      </div>
    </div>
  );
}

export default App;
