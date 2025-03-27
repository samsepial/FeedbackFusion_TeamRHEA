import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

// Components
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CreateAlerts from "./pages/CreateAlerts";
import UserManagement from './pages/UserManagement';
import Results from "./pages/Results";
import HistoricalAnalysis from "./pages/HistoricalAnalysis";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path="/user-management" element={<PrivateRoute><Layout><UserManagement /></Layout></PrivateRoute>} />
            <Route path="/create-alerts" element={<PrivateRoute><Layout><CreateAlerts /></Layout></PrivateRoute>} />
            <Route path="/results" element={<PrivateRoute><Layout><Results /></Layout></PrivateRoute>} />
            <Route path="/historical-analysis" element={<PrivateRoute><Layout><HistoricalAnalysis /></Layout></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default App;