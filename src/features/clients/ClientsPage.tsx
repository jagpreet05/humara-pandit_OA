import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, Plus, Users, Mail, Phone,
  MoreHorizontal, UserPlus,
} from 'lucide-react';
import { clientsApi } from '../../lib/mock-api/clients';
import type { Client } from '../../types/client';
import { formatDate, cn } from '../../lib/utils';
import { CardSkeleton } from '../../components/shared/Skeletons';
import { EmptyState, ErrorState } from '../../components/shared/StateComponents';

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selected, setSelected] = useState<Client | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await clientsApi.getAll({ search, status: statusFilter });
      setClients(result);
    } catch {
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} total clients</p>
        </div>
        <button id="clients-add-btn" className="btn-primary">
          <UserPlus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="clients-search"
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              id={`clients-filter-${s}`}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState description={error} action={<button onClick={load} className="btn-primary">Retry</button>} />}

      {/* Client Grid */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading
            ? Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
            : clients.length === 0
            ? (
              <div className="col-span-full">
                <EmptyState
                  icon={<Users className="w-7 h-7 text-brand-400" />}
                  title="No clients found"
                  description="Try adjusting your search or add a new client."
                  action={<button className="btn-primary"><Plus className="w-4 h-4" /> Add Client</button>}
                />
              </div>
            )
            : clients.map((client) => (
              <div
                key={client.id}
                id={`client-card-${client.id}`}
                className={cn(
                  'card p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
                  selected?.id === client.id && 'ring-2 ring-brand-500'
                )}
                onClick={() => setSelected(selected?.id === client.id ? null : client)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: client.avatarColor }}
                    >
                      {client.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{client.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[160px]">{client.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={client.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                      {client.status}
                    </span>
                    <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  <a
                    href={`mailto:${client.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </a>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">{client.totalSessions}</p>
                    <p className="text-[10px] text-slate-400">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">{client.totalHours}h</p>
                    <p className="text-[10px] text-slate-400">Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{formatDate(client.lastSession)}</p>
                    <p className="text-[10px] text-slate-400">Last session</p>
                  </div>
                </div>

                {/* Expanded notes */}
                {selected?.id === client.id && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Notes</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{client.notes}</p>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
