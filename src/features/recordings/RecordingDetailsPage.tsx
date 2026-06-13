import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, Calendar, Clock, Download, Edit3, Trash2,
  Play, Pause, SkipBack, SkipForward, Volume2, Tag, FileText,
  User, ChevronRight,
} from 'lucide-react';
import { recordingsApi } from '../../lib/mock-api/recordings';
import type { Recording } from '../../types/recording';
import { formatDuration, formatDate, formatFileSize, formatDateTime, cn } from '../../lib/utils';
import { Skeleton } from '../../components/shared/Skeletons';
import { ErrorState } from '../../components/shared/StateComponents';

const STATUS_STYLE: Record<string, string> = {
  completed: 'badge-completed',
  pending: 'badge-pending',
  archived: 'badge-archived',
};

export function RecordingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(27);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    recordingsApi.getById(id).then((rec) => {
      if (!rec) setError('Recording not found');
      else { setRecording(rec); setNotes(rec.notes); }
      setLoading(false);
    });
  }, [id]);

  const togglePlay = () => setIsPlaying((v) => !v);

  const handleSaveNotes = async () => {
    if (!recording) return;
    await recordingsApi.update(recording.id, { notes });
    setRecording((r) => r ? { ...r, notes } : r);
    setEditingNotes(false);
  };

  const handleDelete = async () => {
    if (!recording || !confirm('Delete this recording?')) return;
    await recordingsApi.delete(recording.id);
    navigate('/recordings');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5 animate-pulse">
        <Skeleton className="h-8 w-48" />
        <div className="card p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !recording) {
    return (
      <ErrorState
        title={error || 'Recording not found'}
        action={<button onClick={() => navigate('/recordings')} className="btn-primary">Back to Recordings</button>}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-slide-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <button onClick={() => navigate('/recordings')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Recordings
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 truncate max-w-[300px]">{recording.title}</span>
      </div>

      {/* Header Card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/25">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{recording.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{recording.clientName}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(recording.date)}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{formatDuration(recording.duration)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={STATUS_STYLE[recording.status]}>{recording.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Audio Player */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-brand-500" /> Audio Player
            </h2>

            {/* Waveform visualization */}
            <div className="bg-gradient-to-r from-brand-950/50 to-violet-950/50 dark:from-brand-950 dark:to-violet-950 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-0.5 h-14 justify-center">
                {Array.from({ length: 80 }).map((_, i) => {
                  const height = Math.abs(Math.sin(i * 0.4) * 40 + Math.sin(i * 0.7) * 15) + 8;
                  const isPlayed = i / 80 < progress / 100;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'w-0.5 rounded-full transition-colors',
                        isPlayed ? 'bg-brand-400' : 'bg-brand-800/60 dark:bg-brand-700/40'
                      )}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <input
                id="audio-progress"
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{formatDuration(Math.floor(recording.duration * progress / 100))}</span>
                <span>{formatDuration(recording.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button id="audio-skip-back" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                id="audio-play-pause"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button id="audio-skip-forward" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" /> Consultation Notes
              </h2>
              <button
                id="notes-edit-btn"
                onClick={() => setEditingNotes((v) => !v)}
                className="btn-ghost py-1 px-2 text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> {editingNotes ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  id="notes-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className="input resize-none"
                  placeholder="Add consultation notes..."
                />
                <button id="notes-save-btn" onClick={handleSaveNotes} className="btn-primary text-xs py-1.5">
                  Save Notes
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {recording.notes || 'No notes added yet.'}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Actions */}
          <div className="card p-5 space-y-2">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Actions</h2>
            <button id="recording-download-btn" className="btn-secondary w-full justify-start">
              <Download className="w-4 h-4" /> Download Recording
            </button>
            <button id="recording-edit-btn" className="btn-secondary w-full justify-start">
              <Edit3 className="w-4 h-4" /> Edit Details
            </button>
            <button id="recording-delete-btn" onClick={handleDelete} className="btn-danger w-full justify-start">
              <Trash2 className="w-4 h-4" /> Delete Recording
            </button>
          </div>

          {/* Details */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Details</h2>
            <dl className="space-y-3">
              {[
                { label: 'Client', value: recording.clientName },
                { label: 'Date', value: formatDate(recording.date) },
                { label: 'Duration', value: formatDuration(recording.duration) },
                { label: 'File Size', value: formatFileSize(recording.fileSize) },
                { label: 'Created', value: formatDateTime(recording.createdAt) },
                { label: 'Updated', value: formatDateTime(recording.updatedAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <dt className="text-xs text-slate-400 shrink-0">{label}</dt>
                  <dd className="text-xs font-medium text-slate-700 dark:text-slate-300 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Tags */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-500" /> Tags
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {recording.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
