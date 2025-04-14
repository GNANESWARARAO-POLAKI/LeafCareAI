import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(username, password, navigate);
    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2>Sign in to your account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Enter Username</label>
          <input
            id="username"
            type="text"
            required
            className="form-input"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? <ClipLoader size={20} color={"#fff"} /> : "Sign in"}
        </button>

        <div className="form-footer">
          <Link to="/register" className="form-link">
            Don't have an account? Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};
