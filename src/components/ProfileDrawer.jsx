import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Edit3, 
  LogOut, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  LogIn,
  Loader2,
  Database,
  Dices,
  Palette
} from 'lucide-react';
import { 
  getAvatarUrl, 
  getRandomAvatarSeed,
  AVATAR_PRESETS,
  PRESET_PERSONAS, 
  saveActiveUser,
  clearActiveUser 
} from '../lib/userStore';
import { authenticateWithEmail } from '../lib/api';

export default function ProfileDrawer({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  onResetSession
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEmailSignIn, setIsEmailSignIn] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);

  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    location: currentUser?.location || 'Seattle, WA',
    avatarSeed: currentUser?.avatarSeed || 'aktivelocal-user'
  });

  if (!isOpen || !currentUser) return null;

  const currentSeed = formData.avatarSeed || currentUser.avatarSeed || currentUser.displayName || 'aktivelocal';
  const avatarUrl = getAvatarUrl(currentSeed);

  const handleShuffleAvatar = () => {
    const newSeed = getRandomAvatarSeed();
    setFormData(prev => ({ ...prev, avatarSeed: newSeed }));
    const updated = {
      ...currentUser,
      avatarSeed: newSeed
    };
    saveActiveUser(updated);
    onUserChanged(updated);
  };

  const handleSelectPreset = (presetSeed) => {
    setFormData(prev => ({ ...prev, avatarSeed: presetSeed }));
    const updated = {
      ...currentUser,
      avatarSeed: presetSeed
    };
    saveActiveUser(updated);
    onUserChanged(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    setAuthMessage(null);
    try {
      const updated = await authenticateWithEmail({
        displayName: formData.displayName.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        avatarSeed: formData.avatarSeed || currentUser.avatarSeed
      });
      onUserChanged(updated);
      setIsEditing(false);
      setShowAvatarPicker(false);
      setAuthMessage({ type: 'success', text: 'Profile saved & synced to Neon Postgres!' });
    } catch (err) {
      setAuthMessage({ type: 'error', text: err.message || 'Failed to save profile' });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleEmailPasswordlessLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginEmail.includes('@')) return;
    setIsLoadingAuth(true);
    setAuthMessage(null);
    try {
      const user = await authenticateWithEmail({ email: loginEmail });
      onUserChanged(user);
      setIsEmailSignIn(false);
      setLoginEmail('');
      setAuthMessage({ type: 'success', text: `Signed in as ${user.displayName || user.email} via Neon Postgres!` });
    } catch (err) {
      setAuthMessage({ type: 'error', text: err.message || 'Error authenticating user' });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSwitchPersona = async (preset) => {
    saveActiveUser(preset);
    onUserChanged(preset);
    setFormData({
      displayName: preset.displayName,
      email: preset.email,
      location: preset.location,
      avatarSeed: preset.avatarSeed
    });
    setIsEditing(false);
    setIsEmailSignIn(false);
    setShowAvatarPicker(false);
  };

  const handleLogout = () => {
    clearActiveUser();
    setIsEditing(false);
    setIsEmailSignIn(false);
    setShowAvatarPicker(false);
    onClose();
    if (onResetSession) {
      onResetSession();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 left-0 max-w-sm w-full bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between z-10 animate-fade-in">
        
        {/* Drawer Header */}
        <div className="p-4 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">User Identity</h2>
            <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 flex items-center gap-1">
              <Database className="w-2.5 h-2.5 text-cyan-600" />
              <span>Neon Postgres</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Feedback banner */}
          {authMessage && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              authMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{authMessage.text}</span>
            </div>
          )}
          
          {/* 400x400 Avatar Container */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-3xl overflow-hidden ring-2 ring-slate-200 shadow-lg bg-slate-100 flex items-center justify-center group-hover:ring-cyan-500 transition-all">
                <img
                  src={avatarUrl}
                  alt={currentUser.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full ring-4 ring-white flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Avatar Quick Switchers */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleShuffleAvatar}
                className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Dices className="w-3 h-3 text-cyan-600" />
                <span>Shuffle</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className={`py-1 px-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1 shadow-sm active:scale-95 ${
                  showAvatarPicker 
                    ? 'bg-cyan-50 text-cyan-800 border-cyan-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Palette className="w-3 h-3 text-cyan-600" />
                <span>Picker</span>
              </button>
            </div>

            {/* Expandable Avatar Grid */}
            {showAvatarPicker && (
              <div className="w-full mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Select Archetype:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_PRESETS.map((preset) => {
                    const presetUrl = getAvatarUrl(preset.seed);
                    const isSelected = currentSeed === preset.seed;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.seed)}
                        className={`p-1 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-400/50 shadow-sm'
                            : 'bg-white hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100">
                          <img src={presetUrl} alt={preset.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 truncate w-full text-center">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Email Passwordless Login Modal Toggle */}
          {isEmailSignIn ? (
            <form onSubmit={handleEmailPasswordlessLogin} className="space-y-3 bg-cyan-50/50 p-4 rounded-2xl border border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900">
                  <Mail className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Email-Based Passwordless Sign In</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmailSignIn(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Enter your email address to sync your identity & created events with Neon Postgres.
              </p>
              <div>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoadingAuth}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 disabled:opacity-50"
              >
                {isLoadingAuth ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                <span>Sign In / Register</span>
              </button>
            </form>
          ) : !isEditing ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs shadow-inner">
              <div className="flex items-center gap-2.5 text-slate-700">
                <User className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Display Name</span>
                  <span className="text-slate-900 font-bold text-sm truncate block">{currentUser.displayName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email (Passwordless Identity)</span>
                  <span className="text-slate-600 font-mono text-xs truncate block">{currentUser.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 pt-1 border-t border-slate-200">
                <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Permanent City</span>
                  <span className="text-slate-700 font-semibold truncate block">{currentUser.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setFormData({
                      displayName: currentUser.displayName,
                      email: currentUser.email,
                      location: currentUser.location,
                      avatarSeed: currentUser.avatarSeed
                    });
                    setIsEditing(true);
                  }}
                  className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setIsEmailSignIn(true)}
                  className="py-2 px-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl text-xs font-semibold transition-all border border-cyan-200 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Email Sign In</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-cyan-300">
              <div>
                <label className="text-[11px] text-slate-600 font-semibold uppercase">Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold uppercase">Email (Passwordless Identity)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold uppercase">City</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoadingAuth}
                  className="flex-1 py-1.5 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-500 shadow-md shadow-cyan-600/20 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isLoadingAuth && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save to Neon</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Persona Switcher for Judges */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>1-Click Preset Personas</span>
            </div>
            <div className="space-y-1.5">
              {PRESET_PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSwitchPersona(p)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between text-xs transition-all ${
                    currentUser.id === p.id
                      ? 'bg-cyan-50 border border-cyan-300 text-cyan-800 font-semibold shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="block font-bold text-slate-900">{p.displayName}</span>
                    <span className="text-[10px] text-slate-500">{p.role}</span>
                  </div>
                  {currentUser.id === p.id && (
                    <span className="text-[10px] bg-cyan-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold transition-all border border-slate-200 hover:border-red-200 flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out & Reset Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
}
