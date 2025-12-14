import React from 'react';
import { SITE_NAME } from '../constants';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => onNavigate('/')}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2 text-white font-bold">
              N
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">{SITE_NAME}</span>
          </div>

          {/* Nav */}
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-4">
                  <span className="text-sm font-semibold text-slate-700">{user.username}</span>
                  <span className="text-xs text-slate-500 capitalize">{user.role?.name || 'User'}</span>
                </div>
                {user.role?.type === 'editor' && (
                  <button 
                     onClick={() => onNavigate('/create')}
                     className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    + New Article
                  </button>
                )}
                <button 
                  onClick={onLogout}
                  className="text-slate-500 hover:text-red-600 font-medium text-sm transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <button 
                  onClick={() => onNavigate('/login')}
                  className="text-slate-600 hover:text-primary font-medium px-3 py-2 text-sm"
                >
                  Log In
                </button>
                <button 
                  onClick={() => onNavigate('/register')}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Built with Strapi & React.
        </div>
      </footer>
    </div>
  );
};

export default Layout;