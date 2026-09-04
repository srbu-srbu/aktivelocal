import React, { useState } from 'react';
import { 
  Sparkles, 
  Dices, 
  Check, 
  MapPin, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight,
  Palette,
  Loader2
} from 'lucide-react';
import { 
  getAvatarUrl, 
  getRandomAvatarSeed, 
  AVATAR_PRESETS, 
  PRESET_PERSONAS, 
  saveActiveUser 
} from '../lib/userStore';
import { authenticateWithEmail } from '../lib/api';

export default function OnboardingModal({
  isOpen,
  onComplete
}) {
  const [avatarSeed, setAvatarSeed] = useState(() => getRandomAvatarSeed());
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Seattle, WA');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const currentAvatarUrl = getAvatarUrl(avatarSeed);

  const handleShuffleAvatar = () => {
    setAvatarSeed(getRandomAvatarSeed());
  };

  const handleSelectPreset = (presetSeed) => {
    setAvatarSeed(presetSeed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) {
      setErrorMsg('Please enter your name and email');
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
      console.error('Onboarding save error:', err);
      // Fallback
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
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in max-h-[95vh] flex flex-col">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-6 text-white text-center relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold tracking-wide mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome to aktivelocal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Set Up Your Community Profile
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Choose your avatar and set your passwordless identity to discover and host local events.
            </p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden ring-4 ring-slate-100 shadow-xl bg-slate-100 flex items-center justify-center transition-all group-hover:ring-cyan-500">
                <img
                  src={currentAvatarUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Avatar Controls */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleShuffleAvatar}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Dices className="w-3.5 h-3.5 text-cyan-600" />
                <span>🎲 Shuffle Random</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPresetPicker(!showPresetPicker)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm active:scale-95 ${
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
              <div className="w-full mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Select an Avatar Archetype:
                </p>
                <div className="grid grid-cols-4 gap-2.5">
                  {AVATAR_PRESETS.map((preset) => {
                    const presetUrl = getAvatarUrl(preset.seed);
                    const isSelected = avatarSeed === preset.seed;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.seed)}
                        className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-400/50 shadow-sm'
                            : 'bg-white hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                          <img src={presetUrl} alt={preset.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Email Address (Passwordless Identity) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Stored in Neon Postgres. No passwords required when returning.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Permanent City / Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Seattle, WA (Downtown)"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>Complete Profile & Enter</span>
            </button>
          </form>

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

      </div>
    </div>
  );
}
