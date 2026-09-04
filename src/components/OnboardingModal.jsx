import React, { useState } from 'react';
import { 
  Sparkles, 
  Dices, 
  MapPin, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Palette, 
  Loader2, 
  Navigation,
  LogIn,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { 
  getAvatarUrl, 
  getRandomAvatarSeed, 
  AVATAR_PRESETS, 
  PRESET_PERSONAS, 
  saveActiveUser 
} from '../lib/userStore';
import { authenticateWithEmail } from '../lib/api';
import { getUserCurrentLocation } from '../lib/geo';

export default function OnboardingModal({
  isOpen,
  onComplete
}) {
  // 'welcome' (Returning email input + New user choice) | 'new-user' (Full form)
  const [viewMode, setViewMode] = useState('welcome');
  
  // Returning user email input
  const [returningEmail, setReturningEmail] = useState('');
  
  // New user form state
  const [avatarSeed, setAvatarSeed] = useState(() => getRandomAvatarSeed());
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Seattle, WA');
  
  // Loading & error feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isLocatingCity, setIsLocatingCity] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const currentAvatarUrl = getAvatarUrl(avatarSeed);

  const handleShuffleAvatar = () => {
    setAvatarSeed(getRandomAvatarSeed());
  };

  const handleSelectPreset = (presetSeed) => {
    setAvatarSeed(presetSeed);
  };

  // 1. Handle Returning User Instant Sign-In
  const handleReturningUserSubmit = async (e) => {
    e.preventDefault();
    if (!returningEmail || !returningEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Look up user in Neon Postgres
      const response = await fetch(`/api/auth/identity?email=${encodeURIComponent(returningEmail.trim())}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.user) {
          setSuccessMsg(`Welcome back, ${data.user.displayName || data.user.email}!`);
          saveActiveUser(data.user);
          setTimeout(() => {
            onComplete(data.user);
          }, 400);
          return;
        }
      }

      // If not found in Neon, prefill email and transition to New User flow
      setEmail(returningEmail.trim());
      setViewMode('new-user');
      setErrorMsg('Email not found in database. Let\'s set up your new profile below:');
    } catch (err) {
      console.warn('Returning user lookup error:', err);
      // Fallback local lookup or new profile
      setEmail(returningEmail.trim());
      setViewMode('new-user');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle New User Registration Submit
  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) {
      setErrorMsg('Please enter your display name and email');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await authenticateWithEmail({
        displayName: displayName.trim(),
        email: email.trim().toLowerCase(),
        location: location.trim() || 'Seattle, WA',
        role: 'Community Member',
        avatarSeed
      });

      onComplete(user);
    } catch (err) {
      console.error('New user save error:', err);
      // Fallback local save
      const fallback = {
        id: `user-${Date.now().toString(36)}`,
        displayName: displayName.trim(),
        email: email.trim().toLowerCase(),
        location: location.trim() || 'Seattle, WA',
        role: 'Community Member',
        avatarSeed
      };
      saveActiveUser(fallback);
      onComplete(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handle1ClickJudge = () => {
    const judge = PRESET_PERSONAS[1];
    saveActiveUser(judge);
    onComplete(judge);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in max-h-[95vh] flex flex-col">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-5 sm:p-6 text-white text-center relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold tracking-wide mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Welcome to aktivelocal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {viewMode === 'welcome' ? 'Community Identity' : 'Create Your Profile'}
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              {viewMode === 'welcome' 
                ? 'Sign in with your email or set up a new profile.' 
                : 'Choose your avatar and set your permanent city.'}
            </p>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl font-medium leading-relaxed animate-fade-in">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= VIEW 1: WELCOME SCREEN (RETURNING VS NEW) ================= */}
          {viewMode === 'welcome' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Returning User Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <LogIn className="w-4 h-4 text-cyan-600" />
                  <span>Returning Member</span>
                </div>
                <p className="text-xs text-slate-500 leading-tight">
                  Enter your email to load your profile and hosted events:
                </p>
                <form onSubmit={handleReturningUserSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="your.email@example.com"
                        value={returningEmail}
                        onChange={e => setReturningEmail(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !returningEmail.trim()}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Go</span>
                      )}
                      {!isLoading && <ArrowRight className="w-3 h-3" />}
                    </button>
                  </div>
                </form>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* New User Option */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setViewMode('new-user');
                  }}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <UserPlus className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Create New Profile (First Time User)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Quick 1-Click for Hackathon Judges */}
              <div className="border-t border-slate-200 pt-3 text-center">
                <button
                  type="button"
                  onClick={handle1ClickJudge}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  <span>⚡ Fast Track: 1-Click Join as Devpost Judge Reviewer</span>
                </button>
              </div>

            </div>
          )}

          {/* ================= VIEW 2: NEW USER FULL PROFILE SETUP ================= */}
          {viewMode === 'new-user' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Back button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setViewMode('welcome');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                  New Member
                </span>
              </div>

              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-slate-100 shadow-xl bg-slate-100 flex items-center justify-center transition-all group-hover:ring-cyan-500">
                    <img
                      src={currentAvatarUrl}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Avatar Controls */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={handleShuffleAvatar}
                    className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <Dices className="w-3.5 h-3.5 text-cyan-600" />
                    <span>🎲 Shuffle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPresetPicker(!showPresetPicker)}
                    className={`py-1 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 shadow-sm active:scale-95 ${
                      showPresetPicker 
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-300' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Choose Style</span>
                  </button>
                </div>

                {/* Expandable Avatar Preset Picker Grid */}
                {showPresetPicker && (
                  <div className="w-full mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                      Select Archetype:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_PRESETS.map((preset) => {
                        const presetUrl = getAvatarUrl(preset.seed);
                        const isSelected = avatarSeed === preset.seed;
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

              {/* New User Form Fields */}
              <form onSubmit={handleNewUserSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Display Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Email (Passwordless Identity) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Permanent City / Location
                    </label>
                    <button
                      type="button"
                      disabled={isLocatingCity}
                      onClick={async () => {
                        setIsLocatingCity(true);
                        try {
                          const gps = await getUserCurrentLocation();
                          setLocation(gps.name || gps.formattedAddress || 'Seattle, WA');
                        } finally {
                          setIsLocatingCity(false);
                        }
                      }}
                      className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {isLocatingCity ? (
                        <Loader2 className="w-3.5 h-3.5 text-cyan-600 animate-spin" />
                      ) : (
                        <Navigation className="w-3.5 h-3.5 text-cyan-600" />
                      )}
                      <span>{isLocatingCity ? 'Detecting...' : 'Current Location'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Seattle, WA (Downtown)"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>Complete Profile & Enter</span>
                </button>
              </form>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
