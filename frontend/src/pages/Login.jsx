import React, { useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import '../styles/loginpage.css';

const Login = () => {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    /* global google */
    if (window.google && googleButtonRef.current) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleLoginSuccess,
      });

      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
      });
    }
  }, []);

  const handleLoginSuccess = async (response) => {
    try {
      const { credential } = response;
      const decoded = jwtDecode(credential);
      const res = await axios.post('http://localhost:5001/auth/google', {
        token: credential,
      });
      console.log('Google user:', decoded);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/';
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="login-page-root d-flex flex-column align-items-center justify-content-center" style={{ height: '100vh' }}>
      <h2 className="mb-4">Login with Google</h2>
      <div ref={googleButtonRef}></div>
    </div>
  );
};

export default Login;
