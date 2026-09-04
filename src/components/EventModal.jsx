import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Repeat, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  X, 
  AlertTriangle,
  Tag,
  AlignLeft,
  Sparkles
} from 'lucide-react';
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
    category: 'Fitness & Outdoors'
  });

  useEffect(() => {
    setCurrentMode(mode);
    setShowCancelRSVPConfirm(false);

    if (event && (mode === 'read' || mode === 'edit')) {
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
        category: event.category || 'Fitness & Outdoors'
      });
    } else if (mode === 'create') {
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
        category: 'Fitness & Outdoors'
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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              {currentMode === 'read' ? 'Event Details' : currentMode === 'edit' ? 'Edit Event' : 'Create New Event'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* ================= READ MODE ================= */}
          {currentMode === 'read' && event && (
            <div className="space-y-4">
              
              {/* Top Banner Category & Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border bg-cyan-50 text-cyan-800 border-cyan-200">
                    {event.category || 'Gathering'}
                  </span>
                  {event.isRecurring && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                      <Repeat className="w-2.5 h-2.5" />
                      <span>Recurring Series</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {event.title}
                </h2>

                <p className="text-xs text-slate-500">
                  Organized by <strong className="text-slate-800">{event.creatorName || 'Community Member'}</strong>
                </p>
              </div>

              {/* Date & Time Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-cyan-100/70 border border-cyan-200 flex items-center justify-center text-cyan-700 flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {new Date(event.datetime).toLocaleDateString([], {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-cyan-700 font-semibold flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-cyan-600" />
                    <span>{new Date(event.datetime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-normal">{event.durationMinutes || 60} mins</span>
                  </div>
                </div>
              </div>

              {/* Location Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3.5 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-center text-orange-600 flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-500">Location</div>
                  <div className="text-sm font-medium text-slate-900 leading-snug">{event.location}</div>
                  <div className="text-xs text-orange-600 font-semibold mt-1">
                    {formattedDistance} from active search area
                  </div>
                </div>
              </div>

              {/* Description Box */}
              {event.description && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
                    <span>About This Event</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Attendees List */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Attendees ({event.attendees?.length || 0})</span>
                  </div>
                  {isRSVPed && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>You are going</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {event.attendees && event.attendees.length > 0 ? (
                    event.attendees.map((a, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-800 shadow-sm"
                        title={a.email}
                      >
                        <img
                          src={getAvatarUrl(a.avatarSeed || a.displayName)}
                          alt={a.displayName}
                          className="w-4 h-4 rounded-full bg-slate-100"
                        />
                        <span className="font-medium max-w-[120px] truncate">{a.displayName}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No RSVPs yet. Be the first to join!</span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ================= CREATE / EDIT FORM MODE ================= */}
          {(currentMode === 'create' || currentMode === 'edit') && (
            <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset 5K Social Run & Brews"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all placeholder-slate-400"
                />
              </div>

              {/* 2. Category & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 transition-all"
                  >
                    <option value="Fitness & Outdoors">Fitness & Outdoors</option>
                    <option value="Social & Drinks">Social & Drinks</option>
                    <option value="Tech & Builders">Tech & Builders</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Community">Community</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={formData.durationMinutes}
                    onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              {/* 3. Date & Time */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.datetime}
                  onChange={e => setFormData({ ...formData, datetime: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 transition-all"
                />
              </div>

              {/* 4. Location */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Location Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Olympic Sculpture Park, Seattle, WA"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 transition-all placeholder-slate-400"
                />
              </div>

              {/* 5. Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the activity, pace, what to bring, meet spot..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 transition-all placeholder-slate-400 leading-relaxed resize-none"
                />
              </div>

            </form>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          
          {currentMode === 'read' ? (
            <>
              {/* Left Actions */}
              <div className="flex items-center gap-2">
                {isCreator ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentMode('edit')}
                      className="flex items-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 text-cyan-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this event?')) {
                          onDelete(event.id);
                          onClose();
                        }
                      }}
                      className="p-2 bg-white hover:bg-red-50 text-red-600 rounded-xl border border-slate-200 shadow-sm transition-all"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2 px-4 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm transition-all"
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
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-orange-500/20 font-extrabold'
                  }`}
                >
                  {isRSVPed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Attending (Cancel)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>RSVP to Event</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (currentMode === 'edit') {
                    setCurrentMode('read');
                  } else {
                    onClose();
                  }
                }}
                className="py-2.5 px-5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="event-form"
                disabled={loading}
                className="py-2.5 px-6 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-cyan-600/20 transition-all"
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
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCancelRSVPConfirm(false)} />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-3 z-10 animate-fade-in shadow-2xl border border-slate-200">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Cancel Your RSVP?</h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove your attendance for <strong>"{event.title}"</strong>?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelRSVPConfirm(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
              >
                Keep RSVP
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelRSVP}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20"
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


