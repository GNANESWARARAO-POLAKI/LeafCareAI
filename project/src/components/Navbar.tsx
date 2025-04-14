import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Sun, Moon, Menu, X, Sprout } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          <Sprout />
          <span>LeafCare AI</span>
        </Link>

        <button 
          className="mobile-menu" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <button onClick={() => handleNavigation('/')} className="nav-link">Home</button>
          <button onClick={() => handleNavigation('/about')} className="nav-link">About</button>
          {user ? (
            <>
              <button onClick={() => handleNavigation('/upload')} className="nav-link">Upload</button>
              <button onClick={() => handleNavigation('/chats')} className="nav-link">Chats</button>
              <button onClick={() => {
                logout();
                setIsMenuOpen(false);
              }} className="nav-link">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavigation('/login')} className="nav-link">Login</button>
              <button onClick={() => handleNavigation('/register')} className="nav-link">Register</button>
            </>
          )}
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon /> : <Sun />}
          </button>
        </div>
      </div>
    </nav>
  );
}