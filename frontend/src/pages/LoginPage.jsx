import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const apiBase = 'https://blog-web-842m.vercel.app';
      
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Login failed');
      }
      // Store token + basic user info in localStorage for navbar / blog posting
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.user) {
        localStorage.setItem('authUser', JSON.stringify(data.user));
        if (typeof onLogin === 'function') {
          onLogin(data.user);
        }
      }
      toast.success('Login successful! Redirecting...');
      navigate('/editor');
      // if (typeof window !== 'undefined') {
      //   window.dispatchEvent(new Event('auth:refresh'));
      // }
      // setTimeout(() => navigate('/editor'), 1000);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="auth-page">
      <ToastContainer />
      
      <div className="auth-container">
        <div className="auth-card">
          <header className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to your account to continue
            </p>
          </header>
          
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter your email address" 
                  className="form-input" 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter your password" 
                  className="form-input" 
                />
              </div>
              
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="checkbox-text">Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
              
              <button type="submit" className="auth-button">
                Sign In
              </button>
            </div>
          </form>
          
          <div className="auth-divider">
            <span className="divider-text">Or continue with</span>
          </div>
          
          <div className="social-buttons">
            <button type="button" className="social-button google-button">
              <span className="social-icon">🔍</span>
              Google
            </button>
            <button type="button" className="social-button github-button">
              <span className="social-icon">💻</span>
              GitHub
            </button>
          </div>
          
          <div className="auth-footer">
            <p className="footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="footer-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;