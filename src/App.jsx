import Login from './pages/Login'
import Goals from './pages/Goals'
import Cards from './pages/Cards'
import Budget from './pages/Budget'
import Accounts from './pages/Accounts'
import NotFound from './pages/NotFound'
import Recurring from './pages/Recurring'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Transactions from './pages/Transactions'
import PrivateRoute from './components/PrivateRoute'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />
      <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
      <Route path="*" element={<NotFound />} />
      <Route path="/cards" element={<PrivateRoute><Cards /></PrivateRoute>} />
      <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
      <Route path="/budget" element={<PrivateRoute><Budget /></PrivateRoute>} />
      <Route path="/recurring" element={<PrivateRoute><Recurring /></PrivateRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}