import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
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
      <div className="relative flex items-center group">
        
        {/* Search Icon */}
        <div className="absolute left-3.5 text-slate-400 group-focus-within:text-cyan-600 transition-colors pointer-events-none flex items-center">
          <Search className="w-4 h-4" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Search local events, activities, topics..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white hover:bg-slate-50/50 focus:bg-white border border-slate-200 hover:border-slate-300 rounded-2xl pl-10 pr-32 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all shadow-sm"
        />

        {/* Clear Search Button if text entered */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-28 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Map Pin Location Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="absolute right-1.5 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 hover:border-cyan-400 text-cyan-700 hover:text-cyan-800 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold transition-all shadow-sm group/btn"
          title="Change search location"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-600 group-hover/btn:scale-110 transition-transform" />
          <span className="max-w-[80px] truncate text-[11px] text-slate-800 font-medium">
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


