import React, { useState } from 'react';
import LocationModal from './LocationModal';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  searchLocation,
  onLocationChange
}) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Search local events, vibes, sports..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#161b22] border border-slate-700/80 rounded-2xl pl-10 pr-28 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
        />

        {/* Map Pin Location Trigger Button (On the right of the search bar) */}
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="absolute right-1.5 flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold transition-all group"
          title="Change search location"
        >
          <span className="text-sm group-hover:scale-110 transition-transform">📍</span>
          <span className="max-w-[75px] truncate text-[11px] text-slate-200">
            {searchLocation.zip || searchLocation.name.split(',')[0]}
          </span>
        </button>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentSearchLocation={searchLocation}
        onLocationSelected={onLocationChange}
      />
    </div>
  );
}
