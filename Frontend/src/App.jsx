import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Feed from './components/feed/Feed';
import Profile from './components/profile/Profile';
import Connections from './components/connections/Connections';
import Messages from './components/messages/Messages';
import './App.css';

const App = () => {
  const isAuthenticated = localStorage.getItem('token') !== null;

  return (
    <Router>
      <AuthProvider>
        <div className="app">
          {isAuthenticated && <Navbar />}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={isAuthenticated ? <Feed /> : <Navigate to="/login" />} />
            <Route path="/profile/:userId?" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/connections" element={isAuthenticated ? <Connections /> : <Navigate to="/login" />} />
            <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/feed" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;