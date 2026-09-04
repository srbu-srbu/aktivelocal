import React from 'react';
import { calculateDistanceMiles, formatDistance } from '../lib/geo';

export default function EventCard({
  event,
  searchLocation,
  currentUser,
  onClick
}) {
  const distanceMiles = calculateDistanceMiles(
    searchLocation.lat,
    searchLocation.lng,
    event.lat,
    event.lng
  );

  const formattedDistance = formatDistance(distanceMiles);

  // Format time (e.g., "6:30 PM")
  const eventDate = new Date(event.datetime);
  const formattedTime = eventDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });

  const attendeeCount = event.attendees?.length || 0;
  const isRSVPed = event.attendees?.some(a => a.id === currentUser.id || a.email === currentUser.email);
  const isCreator = event.creatorId === currentUser.id;

  return (
    <div
      onClick={() => onClick(event)}
      className="group relative bg-[#161b22] hover:bg-[#1c2128] border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-4 cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        
        {/* Main 2-Line Content */}
        <div className="flex-1 min-w-0">
          
          {/* Line 1: Event Title */}
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
              {event.title}
            </h3>
            {event.isRecurring && (
              <span className="text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800/50 flex-shrink-0">
                🔄 Recurring
              </span>
            )}
          </div>

          {/* Line 2: Time, Distance, # Attending */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="text-cyan-400 font-semibold">{formattedTime}</span>
            <span>•</span>
            <span className="text-slate-300">{formattedDistance}</span>
            <span>•</span>
            <span className="text-slate-300">
              <strong className="text-white">{attendeeCount}</strong> attending
            </span>
          </div>

        </div>

        {/* Right Badges (RSVPed / Creator) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isCreator && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-medium">
              Host
            </span>
          )}
          {isRSVPed && (
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/60 font-semibold flex items-center gap-1">
              ✓ Going
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
