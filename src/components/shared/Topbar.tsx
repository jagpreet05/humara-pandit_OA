import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, Search, LogOut, User, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface TopbarProps {
  onMenuToggle?: () => void;
  showMenu?: boolean;
}

export function Topbar({ onMenuToggle, showMenu }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0f0f17] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 gap-4 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {showMenu && (
          <button
            id="topbar-menu-toggle"
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="topbar-search"
            type="text"
            placeholder="Search recordings..."
            className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 transition-all"
            onFocus={(e) => (e.target.style.width = '300px')}
            onBlur={(e) => (e.target.style.width = '')}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          id="topbar-theme-toggle"
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5 w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button
          id="topbar-notifications"
          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            id="topbar-user-menu"
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: user?.avatarColor ?? '#6366f1' }}
            >
              {user?.initials ?? 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                {user?.name ?? 'User'}
              </p>
              <p className="text-xs text-slate-400 capitalize">{user?.role ?? 'admin'}</p>
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 z-20 card shadow-lg border border-slate-200 dark:border-slate-700 py-1 animate-fade-in">
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile Settings
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                <button
                  id="topbar-logout"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
