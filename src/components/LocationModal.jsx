import React, { useState } from 'react';
import { resolveLocation, getUserCurrentLocation, CITY_COORDINATES } from '../lib/geo';

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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0d1117] border border-slate-700/80 rounded-2xl shadow-2xl p-6 z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <h3 className="text-base font-bold text-white">Set Search Location</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Events within a <strong className="text-cyan-400">50-mile radius</strong> will be queried for this location. Stored only in your device local storage.
        </p>

        {/* Current Active */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-4 text-xs flex items-center justify-between">
          <span className="text-slate-400">Current search area:</span>
          <span className="text-cyan-300 font-semibold">{currentSearchLocation.name}</span>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleApply(inputVal); }} className="space-y-3">
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">
              Enter ZIP Code or City
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 98101, Seattle, San Francisco"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                {loading ? '...' : 'Set'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleUseGPS}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <span>🎯 Use Current GPS Location</span>
            </button>
          </div>
        </form>

        {/* Quick Cities */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Popular Cities
          </span>
          <div className="flex flex-wrap gap-1.5">
            {['Seattle', 'San Francisco', 'New York', 'Austin', 'Los Angeles', 'Chicago'].map(city => (
              <button
                key={city}
                type="button"
                onClick={() => handleApply(city)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 hover:border-cyan-500/40 border border-slate-800 text-slate-300 text-xs rounded-lg transition-all"
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
