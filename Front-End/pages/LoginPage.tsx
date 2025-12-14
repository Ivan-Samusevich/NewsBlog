import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
  onLogin: (identifier: string, password: string) => Promise<any>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('editor');
  const [password, setPassword] = useState('password'); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(identifier, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100 mt-12">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email or Username</label>
          <input 
            type="text" 
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="Type 'editor' for admin rights"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors">
          Log In
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-slate-500">
        Demo tip: use username <b>editor</b> or <b>user</b>.
      </div>
    </div>
  );
};

export default LoginPage;