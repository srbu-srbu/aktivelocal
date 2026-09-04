import React from 'react';
import { Search, Calendar, Sparkles } from 'lucide-react';
import { getAvatarUrl } from '../lib/userStore';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onOpenProfile 
}) {
  const avatarUrl = getAvatarUrl(currentUser.avatarSeed || currentUser.displayName);

  return (
    <header className="sticky top-0 z-30 glass-nav px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: User Profile Trigger */}
        <button
          onClick={onOpenProfile}
          className="relative group flex items-center gap-2.5 p-1 -ml-1 rounded-full hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          title="Open User Profile & Settings"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-1.5 ring-slate-200 group-hover:ring-cyan-500 transition-all bg-slate-100 shadow-sm">
              <img
                src={avatarUrl}
                alt={currentUser.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 ring-2 ring-white rounded-full" />
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors max-w-[90px] truncate">
            {currentUser.displayName.split(' ')[0]}
          </span>
        </button>

        {/* Center: Brand Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none group" 
          onClick={() => setActiveTab('search')}
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-orange-500 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-cyan-600">aktive</span>
            <span className="text-orange-500">local</span>
          </span>
        </div>

        {/* Right: Segmented Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/90 text-xs font-semibold shadow-inner">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-white text-cyan-700 font-bold shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          <button
            onClick={() => setActiveTab('my-events')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              activeTab === 'my-events'
                ? 'bg-white text-orange-600 font-bold shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>My Events</span>
          </button>
        </div>

      </div>
    </header>
  );
}


