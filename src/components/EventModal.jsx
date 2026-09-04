import React, { useState, useEffect } from 'react';
import { calculateDistanceMiles, formatDistance, resolveLocation } from '../lib/geo';
import { getAvatarUrl } from '../lib/userStore';

export default function EventModal({
  isOpen,
  mode = 'read', // 'read' | 'create' | 'edit'
  event,
  currentUser,
  searchLocation,
  onClose,
  onSave,
  onDelete,
  onToggleRSVP
}) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [showCancelRSVPConfirm, setShowCancelRSVPConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    datetime: '',
    location: '',
    description: '',
    durationMinutes: 60,
    category: 'Community'
  });

  useEffect(() => {
    setCurrentMode(mode);
    setShowCancelRSVPConfirm(false);

    if (event && (mode === 'read' || mode === 'edit')) {
      // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
      let localDt = '';
      try {
        const d = new Date(event.datetime);
        const offset = d.getTimezoneOffset() * 60000;
        localDt = new Date(d.getTime() - offset).toISOString().slice(0, 16);
      } catch {
        localDt = '';
      }

      setFormData({
        title: event.title || '',
        datetime: localDt,
        location: event.location || '',
        description: event.description || '',
        durationMinutes: event.durationMinutes || 60,
        category: event.category || 'Community'
      });
    } else if (mode === 'create') {
      // Default to tomorrow 6 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      const offset = tomorrow.getTimezoneOffset() * 60000;
      const defaultDt = new Date(tomorrow.getTime() - offset).toISOString().slice(0, 16);

      setFormData({
        title: '',
        datetime: defaultDt,
        location: searchLocation.name || 'Seattle, WA',
        description: '',
        durationMinutes: 60,
        category: 'Gathering'
      });
    }
  }, [mode, event, isOpen, searchLocation]);

  if (!isOpen) return null;

  const isCreator = event && event.creatorId === currentUser.id;
  const isRSVPed = event && event.attendees?.some(a => a.id === currentUser.id || a.email === currentUser.email);

  // Distance calculation for read mode
  const distanceMiles = event ? calculateDistanceMiles(
    searchLocation.lat,
    searchLocation.lng,
    event.lat,
    event.lng
  ) : 0;
  const formattedDistance = formatDistance(distanceMiles);

  // Handle RSVP Toggle
  const handleRSVPClick = () => {
    if (isRSVPed) {
      // Prompt confirmation popup to cancel
      setShowCancelRSVPConfirm(true);
    } else {
      onToggleRSVP(event.id);
    }
  };

  const handleConfirmCancelRSVP = () => {
    setShowCancelRSVPConfirm(false);
    onToggleRSVP(event.id);
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.datetime || !formData.location.trim()) {
      alert('Please fill out Event Title, Date & Time, and Location.');
      return;
    }

    setLoading(true);
    const resolvedGeo = await resolveLocation(formData.location);
    const payload = {
      ...formData,
      datetime: new Date(formData.datetime).toISOString(),
      lat: resolvedGeo.lat,
      lng: resolvedGeo.lng
    };

    await onSave(payload, currentMode === 'edit' ? event.id : null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0d1117] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800/90 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">
              {currentMode === 'read' ? 'Event Details' : currentMode === 'edit' ? 'Edit Event' : 'Create New Event'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* ================= READ MODE ================= */}
          {currentMode === 'read' && event && (
            <div className="space-y-4">
              
              {/* Title */}
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {event.title}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span>Hosted by <strong className="text-slate-200">{event.creatorName || 'Organizer'}</strong></span>
                  {event.isRecurring && (
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800">
                      🔄 Recurring Series
                    </span>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                <span className="text-2xl">🗓️</span>
                <div>
                  <div className="text-sm font-bold text-cyan-400">
                    {new Date(event.datetime).toLocaleDateString([], {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-slate-300">
                    {new Date(event.datetime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    {' '}({event.durationMinutes || 60} mins)
                  </div>
                </div>
              </div>

              {/* Location with (x miles away) */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="text-2xl mt-0.5">📍</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-400">Location</div>
                  <div className="text-sm font-medium text-white">{event.location}</div>
                  <div className="text-xs text-orange-400 font-semibold mt-0.5">
                    ({formattedDistance} away from active search)
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    About This Event
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Attendees List */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Attendees ({event.attendees?.length || 0})
                  </span>
                  {isRSVPed && (
                    <span className="text-xs text-emerald-400 font-bold">You are going!</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {event.attendees && event.attendees.length > 0 ? (
                    event.attendees.map((a, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-full text-xs text-slate-200"
                        title={a.email}
                      >
                        <img
                          src={getAvatarUrl(a.avatarSeed || a.displayName)}
                          alt={a.displayName}
                          className="w-5 h-5 rounded-full bg-slate-900"
                        />
                        <span className="font-medium max-w-[120px] truncate">{a.displayName}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Be the first to RSVP!</span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ================= CREATE / EDIT FORM MODE ================= */}
          {(currentMode === 'create' || currentMode === 'edit') && (
            <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. Event Title */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset 5K Social Run & Brews"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                />
              </div>

              {/* 2. Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.datetime}
                    onChange={e => setFormData({ ...formData, datetime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={formData.durationMinutes}
                    onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* 3. Event Location */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Event Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Olympic Sculpture Park, 2901 Western Ave, Seattle, WA"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Location is automatically geocoded for 50-mile radius calculations.
                </span>
              </div>

              {/* 4. Event Description */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Event Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the activity, what to bring, pace, meet spot, etc."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all placeholder-slate-500 leading-relaxed resize-none"
                />
              </div>

            </form>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-slate-800/90 bg-slate-950/90 flex items-center justify-between gap-3">
          
          {currentMode === 'read' ? (
            <>
              {/* Left Actions (Creator Edit / Delete) */}
              <div className="flex items-center gap-2">
                {isCreator ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentMode('edit')}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                    >
                      ✏️ Edit Event
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this event?')) {
                          onDelete(event.id);
                          onClose();
                        }
                      }}
                      className="py-2 px-3 bg-slate-900 hover:bg-red-950/60 text-red-400 text-xs font-semibold rounded-xl border border-slate-800 transition-all"
                    >
                      🗑️
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2 px-4 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-all"
                  >
                    Close
                  </button>
                )}
              </div>

              {/* Right Action: RSVP Toggle */}
              <div>
                <button
                  type="button"
                  onClick={handleRSVPClick}
                  className={`py-2.5 px-6 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                    isRSVPed
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-500/20 font-extrabold'
                  }`}
                >
                  {isRSVPed ? '✓ Attending (Click to Cancel)' : 'RSVP to Event'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Create / Edit Bottom: Cancel on Left, Save on Right */}
              <button
                type="button"
                onClick={() => {
                  if (currentMode === 'edit') {
                    setCurrentMode('read');
                  } else {
                    onClose();
                  }
                }}
                className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="event-form"
                disabled={loading}
                className="py-2.5 px-6 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
              >
                {loading ? 'Saving...' : currentMode === 'edit' ? 'Save Changes' : 'Publish Event'}
              </button>
            </>
          )}

        </div>

      </div>

      {/* Confirmation Popup for Cancelling RSVP */}
      {showCancelRSVPConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCancelRSVPConfirm(false)} />
          <div className="relative bg-[#161b22] border border-slate-700 rounded-2xl p-5 max-w-sm w-full text-center space-y-3 z-10 animate-fade-in shadow-2xl">
            <div className="text-3xl">⚠️</div>
            <h4 className="text-base font-bold text-white">Cancel Your RSVP?</h4>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove your attendance for <strong>"{event.title}"</strong>?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelRSVPConfirm(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
              >
                Keep RSVP
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelRSVP}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl"
              >
                Yes, Cancel RSVP
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
