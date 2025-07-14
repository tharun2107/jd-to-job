import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profilepage.css';

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const Profile = () => {
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="profile-page-root">
      <div className="profile-card">
        <div className="profile-avatar">
          <img src={user.picture || user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`} alt="Profile" />
        </div>
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-email">{user.email}</p>
        <button className="profile-logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Profile; 