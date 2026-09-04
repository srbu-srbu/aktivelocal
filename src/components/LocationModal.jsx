import React, { useState } from 'react';
import { MapPin, Navigation, Compass, X } from 'lucide-react';
import { resolveLocation, getUserCurrentLocation } from '../lib/geo';

export default function LocationModal({
  isOpen,
  onClose,
  currentSearchLocation,
  onLocationSelected
}) {
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleApply = async (query) => {
    if (!query || !query.trim()) return;
    setLoading(true);
    const resolved = await resolveLocation(query);
    onLocationSelected(resolved);
    setLoading(false);
    onClose();
  };

  const handleUseGPS = async () => {
    setLoading(true);
    const resolved = await getUserCurrentLocation();
    onLocationSelected(resolved);
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

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Search Location</h3>
              <p className="text-[11px] text-slate-500">Queries events within 50 miles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Location Pill */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4 text-xs flex items-center justify-between shadow-inner">
          <span className="text-slate-500 font-medium">Active area:</span>
          <span className="text-cyan-700 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            {currentSearchLocation.name}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleApply(inputVal); }} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Enter ZIP Code or City
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 98101, Seattle, Austin..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all"
              >
                {loading ? '...' : 'Apply'}
              </button>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleUseGPS}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm group"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-600 group-hover:scale-110 transition-transform" />
              <span>Use Current GPS Location</span>
            </button>
          </div>
        </form>

        {/* Quick Cities */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            <Compass className="w-3 h-3 text-slate-400" />
            <span>Popular Cities</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Seattle', 'San Francisco', 'New York', 'Austin', 'Los Angeles', 'Chicago'].map(city => (
              <button
                key={city}
                type="button"
                onClick={() => handleApply(city)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 hover:border-cyan-300 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium rounded-xl transition-all shadow-sm"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}


