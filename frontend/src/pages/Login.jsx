import React, { useEffect, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Login = () => {
  const googleButtonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    /* global google */
    if (window.google && googleButtonRef.current) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleLoginSuccess,
      });

      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        width: 280,
      });
    }
  }, []);

  const handleLoginSuccess = async (response) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d1b2a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      
      {/* Animated Background Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite',
      }} />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.2})`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Glowing Orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'pulse 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'pulse 10s ease-in-out infinite reverse',
      }} />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '440px',
          margin: '20px',
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '48px 40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        }}>
          
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ textAlign: 'center', marginBottom: '32px' }}
          >
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '70px',
                height: '70px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                marginBottom: '16px',
                boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)',
              }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>N</span>
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
              }}>
                NextHire
              </h1>
            </Link>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: 'center', marginBottom: '40px' }}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '8px',
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.5,
            }}>
              Sign in to access your AI-powered career tools
            </p>
          </motion.div>

          {/* Google Sign In Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {isLoading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 32px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '50px',
                color: '#3b82f6',
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #3b82f6',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                  }}
                />
                <span>Signing in...</span>
              </div>
            ) : (
              <div 
                ref={googleButtonRef}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              />
            )}
          </motion.div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '32px 0',
            gap: '16px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Secure Login
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          </div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {[
              { icon: '📊', label: 'ATS Analysis' },
              { icon: '🎯', label: 'Mock Tests' },
              { icon: '📝', label: 'Resume Builder' },
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '16px 8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{feature.icon}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{feature.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            textAlign: 'center',
            fontSize: '13px',
            color: '#64748b',
            marginTop: '24px',
          }}
        >
          By signing in, you agree to our{' '}
          <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms</a>
          {' '}and{' '}
          <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Privacy Policy</a>
        </motion.p>
      </motion.div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default Login;
