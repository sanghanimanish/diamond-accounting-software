import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import CompanyManagement from './components/CompanyManagement';
import BranchManagement from './components/BranchManagement';
import AccountManagement from './components/AccountManagement';
import JournalManagement from './components/JournalManagement';
import SupplierManagement from './components/SupplierManagement';
import PurchaseManagement from './components/PurchaseManagement';
import CustomerManagement from './components/CustomerManagement';
import SalesManagement from './components/SalesManagement';
import StockReport from './components/StockReport';
import PaymentManagement from './components/PaymentManagement';
import TrialBalance from './components/TrialBalance';
import ProfitLoss from './components/ProfitLoss';
import BalanceSheet from './components/BalanceSheet';
import LedgerReport from './components/LedgerReport';
import StockMovementReport from './components/StockMovementReport';
import CurrencyManagement from './components/CurrencyManagement';
import AdminLayout from './components/AdminLayout';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Guest Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* General Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
           <Route path="/dashboard" element={<Dashboard />} />
           
           {/* Admin & Higher Logic Routes */}
           <Route path="/users" element={<UserManagement />} />
           <Route path="/companies" element={<CompanyManagement />} />
           <Route path="/branches" element={<BranchManagement />} />
           <Route path="/accounts" element={<AccountManagement />} />
           <Route path="/journal" element={<JournalManagement />} />
           <Route path="/suppliers" element={<SupplierManagement />} />
           <Route path="/purchases" element={<PurchaseManagement />} />
           <Route path="/customers" element={<CustomerManagement />} />
           <Route path="/sales" element={<SalesManagement />} />
           <Route path="/stock" element={<StockReport />} />
           <Route path="/stock/movements" element={<StockMovementReport />} />
           <Route path="/payments" element={<PaymentManagement />} />
           <Route path="/reports/trial-balance" element={<TrialBalance />} />
           <Route path="/reports/profit-loss" element={<ProfitLoss />} />
           <Route path="/reports/balance-sheet" element={<BalanceSheet />} />
           <Route path="/reports/ledger" element={<LedgerReport />} />
           <Route path="/currencies" element={<CurrencyManagement />} />
        </Route>
      </Route>

      {/* Default Fallback */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;
