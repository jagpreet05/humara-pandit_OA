import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Mic,
  Users,
  Upload,
  Settings,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/recordings', label: 'Recordings', icon: Mic },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white dark:bg-[#0f0f17] border-r border-slate-200 dark:border-slate-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shrink-0">
          <Headphones className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
              ConsultRec
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
              Manager
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, exact }) => {
          const active = isActive(to, exact);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex items-center rounded-lg transition-all duration-200',
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                active
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                className={cn(
                  'shrink-0 transition-colors',
                  collapsed ? 'w-5 h-5' : 'w-4 h-4',
                  active ? 'text-brand-600 dark:text-brand-400' : 'text-current'
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium flex-1">{label}</span>
              )}
              {!collapsed && active && (
                <ChevronRight className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-lg bg-gradient-to-br from-brand-500/10 to-violet-500/10 border border-brand-100 dark:border-brand-900/50 p-3">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 mb-1">Pro Plan</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed">
              30 recordings · 10 clients
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
