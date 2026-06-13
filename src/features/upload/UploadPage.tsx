import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileAudio, X, CheckCircle2, Loader2,
  Calendar, User, FileText, ChevronRight, ArrowLeft,
} from 'lucide-react';
import { recordingsApi } from '../../lib/mock-api/recordings';
import { cn } from '../../lib/utils';

type Step = 'form' | 'uploading' | 'success';

export function UploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '',
    clientName: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    tags: '',
  });
  const [error, setError] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type.startsWith('audio/') || f.name.endsWith('.mp3') || f.name.endsWith('.wav') || f.name.endsWith('.m4a'))) {
      setFile(f);
    } else {
      setError('Please upload an audio file (MP3, WAV, M4A)');
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.clientName) {
      setError('Title and client name are required');
      return;
    }
    setError('');
    setStep('uploading');
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(interval); return p; }
        return p + Math.random() * 12;
      });
    }, 200);

    try {
      await recordingsApi.create({
        title: form.title,
        clientId: `cli-${Date.now()}`,
        clientName: form.clientName,
        date: form.date,
        duration: Math.floor(Math.random() * 3600 + 600),
        fileSize: file?.size ?? 0,
        status: 'pending',
        notes: form.notes,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setStep('success'), 500);
    } catch {
      clearInterval(interval);
      setStep('form');
      setError('Upload failed. Please try again.');
    }
  };

  if (step === 'uploading') {
    return (
      <div className="max-w-lg mx-auto mt-16 animate-fade-in">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Uploading Recording</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Please wait while we process your recording...</p>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">{Math.round(Math.min(100, progress))}%</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto mt-16 animate-slide-up">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload Successful!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            <span className="font-medium text-slate-700 dark:text-slate-300">{form.title}</span> has been uploaded and is being processed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="upload-view-recordings"
              onClick={() => navigate('/recordings')}
              className="btn-primary flex-1"
            >
              View Recordings <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="upload-another"
              onClick={() => { setStep('form'); setFile(null); setForm({ title: '', clientName: '', date: new Date().toISOString().slice(0, 10), notes: '', tags: '' }); }}
              className="btn-secondary flex-1"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="page-title">Upload Recording</h1>
        <p className="page-subtitle">Add a new consultation recording to your library</p>
      </div>

      <form id="upload-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Drop zone */}
        <div
          id="upload-dropzone"
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
            dragOver
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input id="file-input" type="file" accept="audio/*,.mp3,.wav,.m4a" className="hidden" onChange={handleFileInput} />

          {file ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center mx-auto">
                <FileAudio className="w-6 h-6 text-brand-500" />
              </div>
              <p className="font-medium text-slate-700 dark:text-slate-300">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mx-auto"
              >
                <X className="w-3 h-3" /> Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Drop your audio file here, or <span className="text-brand-600 dark:text-brand-400">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">MP3, WAV, M4A up to 500MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="card p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="upload-title" className="label">
                Recording Title <span className="text-red-500">*</span>
              </label>
              <input
                id="upload-title"
                type="text"
                required
                placeholder="e.g. Initial Tax Planning Consultation"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="upload-client" className="label">
                <User className="w-3.5 h-3.5 inline mr-1" /> Client Name <span className="text-red-500">*</span>
              </label>
              <input
                id="upload-client"
                type="text"
                required
                placeholder="Client's full name"
                value={form.clientName}
                onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="upload-date" className="label">
                <Calendar className="w-3.5 h-3.5 inline mr-1" /> Consultation Date
              </label>
              <input
                id="upload-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="upload-tags" className="label">Tags (comma-separated)</label>
              <input
                id="upload-tags"
                type="text"
                placeholder="tax, planning, review"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="upload-notes" className="label">
              <FileText className="w-3.5 h-3.5 inline mr-1" /> Notes
            </label>
            <textarea
              id="upload-notes"
              rows={4}
              placeholder="Add consultation notes, key points discussed, follow-up items..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="input resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" id="upload-submit-btn" className="btn-primary flex-1">
              <Upload className="w-4 h-4" /> Upload Recording
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
