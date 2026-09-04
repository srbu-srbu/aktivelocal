import React from 'react';
import EventCard from './EventCard';

export default function EventList({
  events,
  searchLocation,
  currentUser,
  onSelectEvent,
  onCreateEventClick,
  activeTab
}) {
  return (
    <div className="space-y-3">
      
      {/* Top Card is ALWAYS '+ Create Event' */}
      <button
        type="button"
        onClick={onCreateEventClick}
        className="w-full bg-[#161b22]/70 hover:bg-[#1c2128] border-2 border-dashed border-slate-700/80 hover:border-cyan-400/80 rounded-2xl p-4 flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold text-sm transition-all duration-150 group shadow-sm"
      >
        <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
          +
        </span>
        <span>Create Event</span>
      </button>

      {/* List of Event Results */}
      {events.length > 0 ? (
        events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            searchLocation={searchLocation}
            currentUser={currentUser}
            onClick={onSelectEvent}
          />
        ))
      ) : (
        <div className="bg-[#161b22]/40 border border-slate-800/80 rounded-2xl p-8 text-center space-y-2">
          <div className="text-3xl">🗓️</div>
          <h4 className="text-sm font-bold text-slate-300">
            {activeTab === 'my-events' ? 'No RSVPed Events Yet' : 'No Events Found for this Day'}
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {activeTab === 'my-events'
              ? 'Browse the Search tab to discover and RSVP to local activities happening around you.'
              : 'Try selecting another day pill, adjusting your search location, or create the first event!'}
          </p>
        </div>
      )}

    </div>
  );
}
