import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterPageProps {
  onRegister: (username: string, email: string, password: string) => Promise<any>;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onRegister(username, email, password);
      navigate('/');
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100 mt-12">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-primary" required />
        </div>
        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-colors">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;