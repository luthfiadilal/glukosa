
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './presentation/Pages/Home';
import Login from './presentation/Pages/auth/Login';
import Register from './presentation/Pages/auth/Register';
import Profile from './presentation/Pages/Profile';
import { AuthProvider } from './presentation/context/AuthContext';
import { ToastProvider } from './presentation/context/ToastContext';
import ProtectedRoute from './presentation/components/ProtectedRoute';
import MainLayout from './presentation/components/MainLayout';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
