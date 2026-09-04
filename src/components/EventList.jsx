import React from 'react';
import { PlusCircle, CalendarX2 } from 'lucide-react';
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
    <div className="space-y-3.5">
      
      {/* Top Card is ALWAYS '+ Create Event' */}
      <button
        type="button"
        onClick={onCreateEventClick}
        className="w-full group relative bg-white hover:bg-slate-50/90 border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-4 flex items-center justify-center gap-2.5 text-slate-700 hover:text-cyan-700 font-bold text-sm transition-all duration-200 shadow-sm"
      >
        <PlusCircle className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform" />
        <span>Create New Gathering</span>
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
        <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <CalendarX2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            {activeTab === 'my-events' ? 'No RSVPs Yet' : 'No Events Found on This Day'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {activeTab === 'my-events'
              ? 'Explore the Search tab to discover and RSVP to local events happening in your area.'
              : 'Try selecting a different day pill above, changing your search location, or create the first event!'}
          </p>
        </div>
      )}

    </div>
  );
}


