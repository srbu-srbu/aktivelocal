import React from 'react';
import { Clock, MapPin, Users, Repeat, CheckCircle2, Crown } from 'lucide-react';
import { calculateDistanceMiles, formatDistance } from '../lib/geo';
import { getAvatarUrl } from '../lib/userStore';

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
      className="group relative bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        
        {/* Main Content: 2-Line Minimalist Structure */}
        <div className="flex-1 min-w-0 space-y-1">
          
          {/* Line 1: Event Title (+ Recurring badge if applicable) */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors truncate tracking-tight">
              {event.title}
            </h3>
            {event.isRecurring && (
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 flex-shrink-0">
                <Repeat className="w-2.5 h-2.5" />
                <span>Recurring</span>
              </span>
            )}
          </div>

          {/* Line 2: Time, Distance, # Attending */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1 text-cyan-700 font-semibold">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span>{formattedTime}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDistance}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span><strong className="text-slate-800 font-semibold">{attendeeCount}</strong> going</span>
            </div>
          </div>

        </div>

        {/* Right Section: Compact Single-Row Badges & Attendee Avatars */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Overlapping Attendee Avatar Stack Preview */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="hidden sm:flex items-center -space-x-1.5">
              {event.attendees.slice(0, 3).map((a, i) => (
                <img
                  key={i}
                  src={getAvatarUrl(a.avatarSeed || a.displayName)}
                  alt={a.displayName}
                  className="w-5 h-5 rounded-full ring-2 ring-white bg-slate-100 object-cover shadow-sm"
                  title={a.displayName}
                />
              ))}
              {event.attendees.length > 3 && (
                <span className="w-5 h-5 rounded-full bg-slate-100 ring-2 ring-white text-[9px] font-bold text-slate-600 flex items-center justify-center shadow-sm">
                  +{event.attendees.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Status Badges */}
          {isCreator && (
            <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
              <Crown className="w-2.5 h-2.5 text-amber-500" />
              <span>Host</span>
            </span>
          )}
          {isRSVPed && (
            <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Going</span>
            </span>
          )}

        </div>

      </div>
    </div>
  );
}


