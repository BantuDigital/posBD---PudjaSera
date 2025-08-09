import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Product from './pages/Product';
import AddProduct from './pages/AddProduct';
import AddCOGS from './pages/AddCOGS';
import EditProduct from './pages/EditProduct';
import ReStockProduct from './pages/ReStockProduct';
import TransactionList from './pages/TransactionList';
import AddTransaction from './pages/AddTransaction';
import ResetPasswordPage from './pages/ResetPasswordPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/product" element={<Product />} />
        <Route path="/product/create" element={<AddProduct />} />
        <Route path="/add-cogs/:productId" element={<AddCOGS />} />
        <Route path="/product/:productId" element={<EditProduct />} />
        <Route path="/restock/:productId" element={<ReStockProduct />} />
        <Route path="/transaction" element={<TransactionList />} />
        <Route path="/transaction/create" element={<AddTransaction />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Redirect any unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
