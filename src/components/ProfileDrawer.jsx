import React, { useState } from 'react';
import { getAvatarUrl, PRESET_PERSONAS, updateActiveUserProfile, saveActiveUser } from '../lib/userStore';

export default function ProfileDrawer({
  isOpen,
  onClose,
  currentUser,
  onUserChanged
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: currentUser.displayName || '',
    email: currentUser.email || '',
    birthYear: currentUser.birthYear || 1996,
    location: currentUser.location || 'Seattle, WA'
  });

  if (!isOpen) return null;

  const avatarUrl = getAvatarUrl(currentUser.avatarSeed || currentUser.displayName);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = updateActiveUserProfile(formData);
    onUserChanged(updated);
    setIsEditing(false);
  };

  const handleSwitchPersona = (preset) => {
    saveActiveUser(preset);
    onUserChanged(preset);
    setFormData({
      displayName: preset.displayName,
      email: preset.email,
      birthYear: preset.birthYear,
      location: preset.location
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Reset to Judge persona
    const judge = PRESET_PERSONAS[1];
    saveActiveUser(judge);
    onUserChanged(judge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 max-w-sm w-full bg-[#0d1117] border-r border-slate-800 shadow-2xl flex flex-col justify-between z-10 animate-fade-in">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>User Profile</span>
            <span className="text-xs font-normal text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/50">
              {currentUser.role || 'Active User'}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* 400x400 Avatar Container */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden ring-2 ring-slate-700/80 shadow-inner bg-slate-900 flex items-center justify-center">
              <img
                src={avatarUrl}
                alt={currentUser.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">
              Deterministic 400×400 DiceBear Avatar
            </p>
          </div>

          {/* Profile Details or Edit Form */}
          {!isEditing ? (
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Display Name</span>
                <span className="text-white font-semibold text-base">{currentUser.displayName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Email</span>
                <span className="text-slate-300 font-mono text-xs">{currentUser.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Birth Year</span>
                  <span className="text-slate-300">{currentUser.birthYear}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Permanent Location</span>
                  <span className="text-slate-300 truncate">{currentUser.location}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setFormData({
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                    birthYear: currentUser.birthYear,
                    location: currentUser.location
                  });
                  setIsEditing(true);
                }}
                className="w-full mt-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold transition-all border border-slate-700"
              >
                ✏️ Edit Profile Details
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 bg-slate-900/90 p-4 rounded-xl border border-cyan-900/50">
              <div>
                <label className="text-xs text-slate-400 font-medium">Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Birth Year</label>
                  <input
                    type="number"
                    min="1920"
                    max="2020"
                    required
                    value={formData.birthYear}
                    onChange={e => setFormData({ ...formData, birthYear: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-cyan-400"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {/* Quick Persona Switcher for Judges */}
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              ⚡ 1-Click Persona Switcher
            </h3>
            <p className="text-[11px] text-slate-500 mb-2">
              Test host organizer permissions vs. attendee RSVP permissions:
            </p>
            <div className="space-y-1.5">
              {PRESET_PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSwitchPersona(p)}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-all ${
                    currentUser.id === p.id
                      ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 font-semibold'
                      : 'bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div>
                    <span className="block font-medium">{p.displayName}</span>
                    <span className="text-[10px] text-slate-500">{p.role}</span>
                  </div>
                  {currentUser.id === p.id && (
                    <span className="text-cyan-400 text-xs font-bold">Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer Footer / Bottom-Aligned Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-red-950/50 text-slate-400 hover:text-red-300 rounded-xl text-xs font-semibold transition-all border border-slate-800 hover:border-red-900/50 flex items-center justify-center gap-2"
          >
            <span>Log Out / Reset Session</span>
          </button>
        </div>

      </div>
    </div>
  );
}
