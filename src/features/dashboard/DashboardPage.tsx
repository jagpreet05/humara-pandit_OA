import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Users, Clock, TrendingUp, ArrowUpRight, ArrowRight,
  Calendar, MoreHorizontal,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { recordingsApi } from '../../lib/mock-api/recordings';
import { clientsApi } from '../../lib/mock-api/clients';
import type { Recording } from '../../types/recording';
import type { Client } from '../../types/client';
import { formatDuration, formatDate, cn } from '../../lib/utils';
import { StatCardSkeleton, ChartSkeleton, TableRowSkeleton } from '../../components/shared/Skeletons';
import { useTheme } from '../../context/ThemeContext';

const STATUS_CONFIG = {
  completed: { label: 'Completed', className: 'badge-completed' },
  pending: { label: 'Pending', className: 'badge-pending' },
  archived: { label: 'Archived', className: 'badge-archived' },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [analytics, setAnalytics] = useState<{
    total: number; totalHours: number; uniqueClients: number;
    monthlyData: { month: string; recordings: number; hours: number }[];
  } | null>(null);
  const [recentRecordings, setRecentRecordings] = useState<Recording[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      recordingsApi.getAnalytics(),
      recordingsApi.getAll({}, 1, 5),
      clientsApi.getAll(),
    ]).then(([anal, recs, cls]) => {
      setAnalytics(anal);
      setRecentRecordings(recs.data);
      setClients(cls);
      setLoading(false);
    });
  }, []);

  const axisColor = isDark ? '#475569' : '#94a3b8';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
    borderRadius: '8px',
    color: isDark ? '#f8fafc' : '#0f172a',
  };

  const statCards = [
    {
      id: 'stat-total-recordings',
      label: 'Total Recordings',
      value: analytics?.total ?? 0,
      icon: Mic,
      color: 'from-brand-500 to-violet-500',
      bg: 'bg-brand-50 dark:bg-brand-950/40',
      iconColor: 'text-brand-600 dark:text-brand-400',
      change: '+12%',
      changeLabel: 'vs last month',
    },
    {
      id: 'stat-total-clients',
      label: 'Total Clients',
      value: analytics?.uniqueClients ?? 0,
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      change: '+2',
      changeLabel: 'new this month',
    },
    {
      id: 'stat-hours-recorded',
      label: 'Hours Recorded',
      value: analytics ? `${analytics.totalHours}h` : '0h',
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      change: '+8.2h',
      changeLabel: 'this month',
    },
    {
      id: 'stat-monthly-activity',
      label: 'This Month',
      value: analytics?.monthlyData?.at(-1)?.recordings ?? 0,
      icon: TrendingUp,
      color: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-50 dark:bg-pink-950/40',
      iconColor: 'text-pink-600 dark:text-pink-400',
      change: '+18%',
      changeLabel: 'vs last month',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Overview of your consultation recording activity
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
            <div key={card.id} id={card.id} className="stat-card group">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', card.bg)}>
                  <card.icon className={cn('w-4.5 h-4.5 w-5 h-5', card.iconColor)} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {card.change}
                </span>
                <span className="text-xs text-slate-400">{card.changeLabel}</span>
              </div>
            </div>
          ))
        }
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart */}
        <div className="lg:col-span-2">
          {loading ? <ChartSkeleton /> : (
            <div className="card p-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Monthly Activity</h2>
              <p className="text-xs text-slate-400 mb-5">Recordings and hours over the last 6 months</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics?.monthlyData ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} />
                  <YAxis tick={{ fontSize: 11, fill: axisColor }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="recordings" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} name="Recordings" />
                  <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: '#8b5cf6', r: 3 }} name="Hours" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div>
          {loading ? <ChartSkeleton /> : (
            <div className="card p-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">By Month</h2>
              <p className="text-xs text-slate-400 mb-5">Recording count per month</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics?.monthlyData ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} />
                  <YAxis tick={{ fontSize: 11, fill: axisColor }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="recordings" fill="#6366f1" radius={[4, 4, 0, 0]} name="Recordings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Recordings */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Recordings</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest consultation recordings</p>
          </div>
          <button
            onClick={() => navigate('/recordings')}
            className="flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 font-medium hover:gap-2.5 transition-all"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header hidden sm:table-cell">Client</th>
                <th className="table-header hidden md:table-cell">Date</th>
                <th className="table-header hidden lg:table-cell">Duration</th>
                <th className="table-header">Status</th>
                <th className="table-header w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : recentRecordings.map((rec) => (
                  <tr
                    key={rec.id}
                    className="table-row cursor-pointer"
                    onClick={() => navigate(`/recordings/${rec.id}`)}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
                          <Mic className="w-4 h-4 text-brand-500" />
                        </div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {rec.title}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className="text-slate-600 dark:text-slate-400">{rec.clientName}</span>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(rec.date)}
                      </div>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(rec.duration)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={STATUS_CONFIG[rec.status].className}>
                        {STATUS_CONFIG[rec.status].label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Clients */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Active Clients</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your most active consultation clients</p>
          </div>
          <button onClick={() => navigate('/clients')} className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {loading
            ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-2 w-2/3" />
              </div>
            ))
            : clients.slice(0, 5).map((client) => (
              <div
                key={client.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                onClick={() => navigate('/clients')}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2"
                  style={{ backgroundColor: client.avatarColor }}
                >
                  {client.initials}
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{client.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{client.totalSessions} sessions</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
