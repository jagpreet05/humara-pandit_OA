import React, { useState } from 'react';
import {
  User, Bell, Palette, Shield, Save, Sun, Moon, Monitor,
  Camera, Mail, Phone, Globe, Loader2, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

type Tab = 'profile' | 'notifications' | 'appearance' | 'security';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: () => void; id: string }) {
  return (
    <button
      id={id}
      onClick={onChange}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-200',
        checked ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '+91 98765 43210',
    website: 'www.vikramconsultants.in',
    bio: 'Certified financial consultant with 10+ years of experience in tax planning, estate management, and investment advisory.',
  });

  const [notifications, setNotifications] = useState({
    newRecording: true,
    clientReminder: true,
    weeklyDigest: false,
    sessionReminder: true,
    systemUpdates: false,
    emailAlerts: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((n) => ({ ...n, [key]: !n[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences and configuration</p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Sidebar tabs */}
        <div className="md:w-52 shrink-0">
          <div className="card p-2 space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`settings-tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  activeTab === id
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-6 animate-fade-in">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Profile Information</h2>
                <p className="text-sm text-slate-400">Update your personal details and public profile</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: user?.avatarColor ?? '#6366f1' }}
                  >
                    {user?.initials}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white hover:bg-brand-600 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile photo</p>
                  <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or GIF. Max 5MB.</p>
                  <button className="text-xs text-brand-600 dark:text-brand-400 mt-1 hover:underline">Upload new photo</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="settings-name" className="label">Full Name</label>
                  <input id="settings-name" type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="input" />
                </div>
                <div>
                  <label htmlFor="settings-email" className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input id="settings-email" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} className="input pl-9" />
                  </div>
                </div>
                <div>
                  <label htmlFor="settings-phone" className="label">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input id="settings-phone" type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="input pl-9" />
                  </div>
                </div>
                <div>
                  <label htmlFor="settings-website" className="label">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input id="settings-website" type="url" value={profile.website} onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))} className="input pl-9" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="settings-bio" className="label">Bio</label>
                <textarea id="settings-bio" rows={3} value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} className="input resize-none" />
              </div>

              <button id="settings-save-profile" onClick={handleSave} className="btn-primary">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Notification Preferences</h2>
                <p className="text-sm text-slate-400">Choose what notifications you receive</p>
              </div>
              {[
                { key: 'newRecording' as const, label: 'New Recording Added', desc: 'Get notified when a new recording is uploaded' },
                { key: 'clientReminder' as const, label: 'Client Reminders', desc: 'Reminders before scheduled client consultations' },
                { key: 'sessionReminder' as const, label: 'Session Reminders', desc: 'Alert 15 minutes before sessions' },
                { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Summary of activity every Monday morning' },
                { key: 'emailAlerts' as const, label: 'Email Alerts', desc: 'Receive alerts via email in addition to in-app' },
                { key: 'systemUpdates' as const, label: 'System Updates', desc: 'Notifications about new features and updates' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <Toggle id={`notif-${key}`} checked={notifications[key]} onChange={() => toggleNotification(key)} />
                </div>
              ))}
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Appearance</h2>
                <p className="text-sm text-slate-400">Customize how ConsultRec looks for you</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light' as const, label: 'Light', icon: Sun },
                    { value: 'dark' as const, label: 'Dark', icon: Moon },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      id={`theme-${value}`}
                      onClick={() => setTheme(value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        theme === value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50'
                          : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', theme === value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400')} />
                      <span className={cn('text-sm font-medium', theme === value ? 'text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400')}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="section-divider" />

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Accent Color</p>
                <p className="text-xs text-slate-400 mb-3">Choose your preferred accent color</p>
                <div className="flex gap-3">
                  {['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#10b981'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 shadow transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Security Settings</h2>
                <p className="text-sm text-slate-400">Keep your account secure</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="settings-current-password" className="label">Current Password</label>
                  <input id="settings-current-password" type="password" placeholder="••••••••" className="input" />
                </div>
                <div>
                  <label htmlFor="settings-new-password" className="label">New Password</label>
                  <input id="settings-new-password" type="password" placeholder="••••••••" className="input" />
                </div>
                <div>
                  <label htmlFor="settings-confirm-password" className="label">Confirm New Password</label>
                  <input id="settings-confirm-password" type="password" placeholder="••••••••" className="input" />
                </div>
                <button id="settings-change-password" className="btn-primary">Update Password</button>
              </div>

              <div className="section-divider" />

              <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-4">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Danger Zone</h3>
                <p className="text-xs text-red-600/70 dark:text-red-500/70 mb-3">These actions are irreversible.</p>
                <button id="settings-delete-account" className="btn-danger text-xs py-1.5">Delete Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
