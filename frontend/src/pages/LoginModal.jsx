import React, { useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import '../styles/loginmodal.css';

const LoginModal = ({ open, onClose }) => {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const handleCredentialResponse = async (response) => {
      try {
        const { credential } = response;
        const decoded = jwtDecode(credential);

        const res = await axios.post('http://localhost:5001/auth/google', {
          token: credential,
        });

        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        window.location.href = '/'; // reload to update navbar etc.
      } catch (err) {
        console.error('Login failed:', err);
        alert('Google login failed.');
      }
    };

    if (open && window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 280,
        shape: 'pill',
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Sign in with Google</h2>
        <div ref={googleButtonRef} className="google-btn-container" />
      </div>
    </div>
  );
};

export default LoginModal;
