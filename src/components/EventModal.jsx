import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Navigation,
  Loader2,
  Check
} from 'lucide-react';
import { 
  calculateDistanceMiles, 
  formatDistance, 
  resolveLocation, 
  searchAddressSuggestions,
  getUserCurrentLocation 
} from '../lib/geo';
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
    lat: null,
    lng: null
  });

  // Location suggestions autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setCurrentMode(mode);
    setShowCancelRSVPConfirm(false);
    setSuggestions([]);
    setShowSuggestions(false);

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
        lat: event.lat || null,
        lng: event.lng || null
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
        lat: searchLocation.lat || null,
        lng: searchLocation.lng || null
      });
    }
  }, [mode, event, isOpen, searchLocation]);

  // Debounced search for address suggestions
  useEffect(() => {
    if (!formData.location || formData.location.trim().length < 3 || currentMode === 'read') {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      const results = await searchAddressSuggestions(formData.location);
      setSuggestions(results);
      setIsSearchingLocation(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.location, currentMode]);

  // Close suggestions dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const isCreator = event && event.creatorId === currentUser?.id;
  const isRSVPed = event && event.attendees?.some(a => a.id === currentUser?.id || a.email === currentUser?.email);

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

  const handleSelectSuggestion = (item) => {
    setFormData(prev => ({
      ...prev,
      location: item.displayName || item.mainText,
      lat: item.lat,
      lng: item.lng
    }));
    setShowSuggestions(false);
  };

  const handleUseCurrentGPSLocation = async () => {
    setIsSearchingLocation(true);
    try {
      const gps = await getUserCurrentLocation();
      setFormData(prev => ({
        ...prev,
        location: gps.formattedAddress || gps.name,
        lat: gps.lat,
        lng: gps.lng
      }));
      setShowSuggestions(false);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.datetime || !formData.location.trim()) {
      alert('Please fill out Event Title, Date & Time, and Location.');
      return;
    }

    setLoading(true);
    let finalLat = formData.lat;
    let finalLng = formData.lng;

    if (!finalLat || !finalLng) {
      const resolvedGeo = await resolveLocation(formData.location);
      finalLat = resolvedGeo.lat;
      finalLng = resolvedGeo.lng;
    }

    const payload = {
      ...formData,
      datetime: new Date(formData.datetime).toISOString(),
      lat: finalLat,
      lng: finalLng
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
              
              {/* Top Title & Recurring tag */}
              <div className="space-y-1.5">
                {event.isRecurring && (
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      <Repeat className="w-2.5 h-2.5" />
                      <span>Recurring Series</span>
                    </span>
                  </div>
                )}

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
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">When</span>
                  <div className="text-sm font-bold text-slate-900">
                    {new Date(event.datetime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(event.datetime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      {event.durationMinutes ? ` (${event.durationMinutes} min)` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Venue & Location Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3.5 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-slate-200/80 border border-slate-300 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Where</span>
                  <div className="text-xs font-semibold text-slate-900 leading-snug break-words">
                    {event.location}
                  </div>
                  <div className="text-[11px] text-cyan-700 font-bold mt-1">
                    {formattedDistance} from your search pin
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">About this Event</span>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Attendees Avatars List */}
              <div className="border-t border-slate-200 pt-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Users className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Attendees ({event.attendees?.length || 0})</span>
                  </div>
                  {isRSVPed && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>You're Going</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {event.attendees && event.attendees.length > 0 ? (
                    event.attendees.map(a => {
                      const aUrl = getAvatarUrl(a.avatarSeed || a.displayName || a.id);
                      return (
                        <div key={a.id || a.email} className="flex-shrink-0 text-center group" title={a.displayName}>
                          <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
                            <img src={aUrl} alt={a.displayName} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[9px] text-slate-500 font-medium block truncate max-w-[50px] mt-0.5">
                            {a.displayName ? a.displayName.split(' ')[0] : 'Guest'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-400 italic">Be the first to RSVP!</span>
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

              {/* 2. Duration & Date/Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* 3. Location with Live Autocomplete Suggestions */}
              <div className="relative" ref={suggestionsRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Venue / Location Address *
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentGPSLocation}
                    className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-cyan-500" />
                    <span>Use My GPS</span>
                  </button>
                </div>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Type address or venue (e.g. Olympic Sculpture Park, Seattle)..."
                    value={formData.location}
                    onChange={e => {
                      setFormData({ ...formData, location: e.target.value, lat: null, lng: null });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all placeholder-slate-400"
                  />
                  {isSearchingLocation && (
                    <Loader2 className="w-4 h-4 text-cyan-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30 max-h-56 overflow-y-auto animate-fade-in">
                    <div className="p-1.5 space-y-0.5">
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-cyan-50 transition-colors flex items-start gap-2.5 group"
                        >
                          <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {item.mainText}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {item.secondaryText}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Description */}
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
