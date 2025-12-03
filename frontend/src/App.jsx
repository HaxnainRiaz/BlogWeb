import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Editor from './components/Editor';
import TermsPage from './pages/TermsPage';
import BlogPage from './pages/BlogPage';
import PrivacyPage from './pages/PrivacyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import './styles/website.css';

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('authUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = async () => {
    const apiBase = 'http://localhost:4025';
    try {
      await fetch(`${apiBase}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      // Clear local auth state and redirect to login
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <div className="website-page">
      <nav className="nav-fixed">
        <div className="nav-container">
          <div className="nav-glass">
            <button
              className="nav-toggle"
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen(v => !v)}
            >
              ☰
            </button>
            <div className={`nav-links ${mobileOpen ? 'is-open' : ''}`}>
              <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/about" className="nav-link" onClick={() => setMobileOpen(false)}>About</Link>
              <Link to="/blog" className="nav-link" onClick={() => setMobileOpen(false)}>Blog</Link>
              <Link to="/contact" className="nav-link" onClick={() => setMobileOpen(false)}>Contact</Link>

              {user ? (
                <>
                  <Link to="/editor" className="nav-link" onClick={() => setMobileOpen(false)}>Editor</Link>
                  <span className="nav-welcome">
                    Welcome, {user.username || user.email || 'User'}
                  </span>
                  <button 
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="nav-logout-btn"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* When not logged in, only show auth links (no editor / user info) */}
                  <Link to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link to="/signup" className="nav-link" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage currentUser={user} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage onLogin={setUser} />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Editor */}
          <Route 
            path="/editor" 
            element={user ? <Editor /> : <Navigate to="/login" />} 
          />
          
          {/* Fallback routes */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;