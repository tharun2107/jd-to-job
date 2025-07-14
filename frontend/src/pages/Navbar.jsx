import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'; // custom styling
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => (window.location.href = '/')}>
        <span>NextHire</span>
      </div>

      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/resume-upload">ATS Analyzer</Link></li>
        <li><Link to="/resources">Resources</Link></li>
        <li><Link to="/mock-test">Mock Test</Link></li>
        <li><Link to="/mock-interview">Mock Interview</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>

      <div className="navbar-auth">
        {token ? (
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        ) : (
          <button className="login-btn" onClick={() => (window.location.href = '/login')}>
            <FaSignInAlt /> Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
