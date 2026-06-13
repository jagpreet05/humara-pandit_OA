import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, LayoutGrid, List, ChevronLeft, ChevronRight,
  Mic, Clock, Calendar, Download, MoreHorizontal, SlidersHorizontal,
  ArrowUpDown, Plus,
} from 'lucide-react';
import { recordingsApi } from '../../lib/mock-api/recordings';
import { clientsApi } from '../../lib/mock-api/clients';
import type { Recording, RecordingFilters } from '../../types/recording';
import type { Client } from '../../types/client';
import { formatDuration, formatDate, cn } from '../../lib/utils';
import { TableRowSkeleton, CardSkeleton } from '../../components/shared/Skeletons';
import { EmptyState, ErrorState } from '../../components/shared/StateComponents';

const STATUS_OPTS = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' },
];

const SORT_OPTS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'duration_desc', label: 'Longest First' },
  { value: 'duration_asc', label: 'Shortest First' },
  { value: 'title_asc', label: 'Title A–Z' },
];

const STATUS_STYLE: Record<string, string> = {
  completed: 'badge-completed',
  pending: 'badge-pending',
  archived: 'badge-archived',
};

export function RecordingsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'table' | 'card'>('table');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<Partial<RecordingFilters>>({
    search: '',
    status: 'all',
    clientId: 'all',
    sortBy: 'date_desc',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await recordingsApi.getAll(filters, page, 10);
      setRecordings(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setError('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    clientsApi.getAll().then(setClients);
  }, []);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const setFilter = (key: keyof RecordingFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Recordings</h1>
          <p className="page-subtitle">{total} total recordings</p>
        </div>
        <button
          id="recordings-upload-btn"
          onClick={() => navigate('/upload')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Upload Recording
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="recordings-search"
              type="text"
              placeholder="Search recordings, clients, notes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                id="recordings-status-filter"
                value={filters.status ?? 'all'}
                onChange={(e) => setFilter('status', e.target.value)}
                className="input pl-8 pr-8 appearance-none cursor-pointer min-w-[140px]"
              >
                {STATUS_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Client filter */}
            <div className="relative">
              <select
                id="recordings-client-filter"
                value={filters.clientId ?? 'all'}
                onChange={(e) => setFilter('clientId', e.target.value)}
                className="input pr-8 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="all">All Clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                id="recordings-sort"
                value={filters.sortBy ?? 'date_desc'}
                onChange={(e) => setFilter('sortBy', e.target.value)}
                className="input pl-8 pr-8 appearance-none cursor-pointer min-w-[140px]"
              >
                {SORT_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                id="recordings-table-view"
                onClick={() => setView('table')}
                className={cn(
                  'p-2.5 transition-colors',
                  view === 'table'
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                id="recordings-card-view"
                onClick={() => setView('card')}
                className={cn(
                  'p-2.5 transition-colors',
                  view === 'card'
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <ErrorState description={error} action={
          <button onClick={load} className="btn-primary">Retry</button>
        } />
      )}

      {/* Table View */}
      {!error && view === 'table' && (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Recording</th>
                <th className="table-header hidden sm:table-cell">Client</th>
                <th className="table-header hidden md:table-cell">Date</th>
                <th className="table-header hidden lg:table-cell">Duration</th>
                <th className="table-header">Status</th>
                <th className="table-header w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : recordings.length === 0
                ? (
                  <tr><td colSpan={6}>
                    <EmptyState title="No recordings found" description="Try adjusting your search or filters." />
                  </td></tr>
                )
                : recordings.map((rec) => (
                  <tr
                    key={rec.id}
                    id={`recording-row-${rec.id}`}
                    className="table-row cursor-pointer"
                    onClick={() => navigate(`/recordings/${rec.id}`)}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
                          <Mic className="w-4 h-4 text-brand-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[220px]">{rec.title}</p>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {rec.tags.slice(0, 2).map((t) => (
                              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell text-slate-600 dark:text-slate-400">{rec.clientName}</td>
                    <td className="table-cell hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />{formatDate(rec.date)}
                      </div>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" />{formatDuration(rec.duration)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={STATUS_STYLE[rec.status]}>{rec.status}</span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {!error && view === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)
            : recordings.length === 0
            ? (
              <div className="col-span-full">
                <EmptyState title="No recordings found" description="Try adjusting your search or filters." />
              </div>
            )
            : recordings.map((rec) => (
              <div
                key={rec.id}
                id={`recording-card-${rec.id}`}
                className="card p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => navigate(`/recordings/${rec.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-brand-500" />
                  </div>
                  <span className={STATUS_STYLE[rec.status]}>{rec.status}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mb-1">{rec.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{rec.clientName}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(rec.date)}</div>
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(rec.duration)}</div>
                </div>
                <div className="flex gap-1 mt-3 flex-wrap">
                  {rec.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">#{t}</span>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages} · {total} recordings
          </p>
          <div className="flex items-center gap-2">
            <button
              id="recordings-prev-page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary py-1.5 px-3"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              id="recordings-next-page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary py-1.5 px-3"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
