import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Categories from './pages/Categories'
import Transactions from './pages/Transactions'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/accounts" element={
            <PrivateRoute><Accounts /></PrivateRoute>
          } />
          <Route path="/categories" element={
            <PrivateRoute><Categories /></PrivateRoute>
          } />
          <Route path="/transactions" element={
            <PrivateRoute><Transactions /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}