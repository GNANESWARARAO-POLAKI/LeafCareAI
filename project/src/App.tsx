import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from "react-helmet-async";
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Upload } from './pages/Upload';
import { Chat } from './pages/Chat';
import { Chats } from './pages/Chats';
import { VerifyOtp } from './pages/verifyotp';
import { NotFound } from './pages/NotFound';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <HelmetProvider>
    <Router>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="bottom-right" autoClose={2000} />

        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verifyotp" element={<VerifyOtp />} />

          {/* Protected Routes */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:sessionId"
            element={
              <ProtectedRoute>
                <Chat/>
              </ProtectedRoute>
            }
          />
           <Route path="*" element={<NotFound/>} />
        </Routes>
      </div>
    </Router>
    </HelmetProvider>
  );
}

export default App;