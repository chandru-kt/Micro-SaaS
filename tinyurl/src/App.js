// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar'; // <-- Import Navbar
import AnalyticsPage from './components/AnalyticsPage'; // <-- Import AnalyticsPage

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken'));

  useEffect(() => {
    const handleStorageChange = () => {
       setIsLoggedIn(!!localStorage.getItem('authToken'));
    };
    window.addEventListener('storage', handleStorageChange);
     handleStorageChange(); // Initial check
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginSuccess = (token) => {
    console.log("Logged in successfully!");
    // Login component stores token and navigates, we just update App's state
    setIsLoggedIn(true);
  };

  // Protected Route Component remains the same
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      {/* Conditionally render Navbar based on login state */}
      {isLoggedIn && <Navbar />}

      {/* Wrap Routes in a container if needed for layout (e.g., padding below navbar) */}
      <div style={{ /* paddingTop: isLoggedIn ? '60px' : '0' */ }}> {/* Example padding */}
        <Routes>
          {/* Login Route */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* Dashboard Route (Now considered "Home") */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard /> {/* Dashboard component still renders here */}
              </ProtectedRoute>
            }
          />

          {/* Analytics Route */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage /> {/* Render the new AnalyticsPage */}
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              // Redirect to dashboard (home) if logged in, else to login
              <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<div><h2>404 Not Found</h2><p>The page you requested does not exist.</p></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;