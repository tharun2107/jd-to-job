import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { FaSignInAlt, FaSignOutAlt, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleMenuToggle = () => setMenuOpen((open) => !open);
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => (window.location.href = '/')}>NextHire</div>
        <button
          className={`navbar-hamburger${menuOpen ? ' open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={handleMenuToggle}
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
          <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
          <li><Link to="/resume-upload" onClick={handleLinkClick}>ATS Analyzer</Link></li>
          <li><Link to="/resources" onClick={handleLinkClick}>Resources</Link></li>
          <li><Link to="/mock-test" onClick={handleLinkClick}>Mock Test</Link></li>
          <li><Link to="/mock-interview" onClick={handleLinkClick}>Mock Interview</Link></li>
          <li><Link to="/dashboard" onClick={handleLinkClick}>Dashboard</Link></li>
          {token && (
            <li><Link to="/profile" onClick={handleLinkClick}><FaUserCircle style={{ marginRight: 4 }} />Profile</Link></li>
          )}
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
      </div>
    </nav>
  );
};

export default Navbar;
