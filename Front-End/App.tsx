import React from 'react';
import { HashRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import CreateArticlePage from './pages/CreateArticlePage';
import EditArticlePage from './pages/EditArticlePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Hooks
import { useAuth } from './hooks/useAuth';

// Main App Container
const App: React.FC = () => {
  const { user, signIn, signUp, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Initializing...</div>;

  return (
    <Layout user={user} onLogout={logout} onNavigate={navigate}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:slug" element={<ArticlePage user={user} />} />
        <Route path="/create" element={<CreateArticlePage user={user} />} />
        <Route path="/edit/:slug" element={<EditArticlePage user={user} />} />
        
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <LoginPage onLogin={signIn} />
        } />
        
        <Route path="/register" element={
          user ? <Navigate to="/" /> : <RegisterPage onRegister={signUp} />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default () => (
  <HashRouter>
    <App />
  </HashRouter>
);