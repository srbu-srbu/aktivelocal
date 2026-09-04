import React from 'react';
import { getAvatarUrl } from '../lib/userStore';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onOpenProfile,
  onOpenCreateEvent 
}) {
  const avatarUrl = getAvatarUrl(currentUser.avatarSeed || currentUser.displayName);

  return (
    <header className="sticky top-0 z-30 bg-[#0d1117]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        
        {/* Left: Profile Avatar Trigger */}
        <button
          onClick={onOpenProfile}
          className="relative group flex items-center focus:outline-none"
          title="Open User Profile"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-700 group-hover:ring-cyan-400 transition-all bg-slate-800">
            <img
              src={avatarUrl}
              alt={currentUser.displayName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0d1117] rounded-full" />
        </button>

        {/* Center: Brand Logo */}
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('search')}>
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-cyan-400">aktive</span>
            <span className="text-orange-500">local</span>
          </span>
        </div>

        {/* Right: Quick Tab Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-full border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'search'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('my-events')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'my-events'
                ? 'bg-orange-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Events
          </button>
        </div>

      </div>
    </header>
  );
}
