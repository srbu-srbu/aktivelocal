import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import ProfileDrawer from './components/ProfileDrawer';
import SearchBar from './components/SearchBar';
import DayPills, { generateSevenDays } from './components/DayPills';
import EventList from './components/EventList';
import EventModal from './components/EventModal';
import WebMCPAgentDock from './components/WebMCPAgentDock';

import { getActiveUser } from './lib/userStore';
import { 
  getAllEvents, 
  queryEventsForDay, 
  filterEventsInMemory, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  toggleEventRSVP 
} from './lib/eventStore';
import { DEFAULT_SEARCH_LOCATION } from './lib/geo';
import { initializeWebMCP } from './lib/webmcp';

const STORAGE_KEY_SEARCH_LOC = 'aktivelocal_search_loc_v1';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'my-events'
  
  // User Profile State
  const [currentUser, setCurrentUser] = useState(getActiveUser);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Search Location (Stored only in localStorage on device)
  const [searchLocation, setSearchLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEARCH_LOC);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SEARCH_LOCATION;
  });

  // Dynamic 7-Day Horizon
  const days = useMemo(() => generateSevenDays(), []);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  // Search Bar Query (0ms instant in-memory filtering)
  const [searchQuery, setSearchQuery] = useState('');

  // Cached Day Events (Database query result for selected day & location)
  const [dayEvents, setDayEvents] = useState([]);

  // Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'read', // 'read' | 'create' | 'edit'
    event: null
  });

  // Initialize WebMCP on mount
  useEffect(() => {
    initializeWebMCP();
  }, []);

  // Save search location to device localStorage when changed
  const handleLocationChange = (newLoc) => {
    setSearchLocation(newLoc);
    try {
      localStorage.setItem(STORAGE_KEY_SEARCH_LOC, JSON.stringify(newLoc));
    } catch (err) {
      console.error(err);
    }
  };

  // Database Query for Selected Day & 50-Mile Radius
  const refreshDayEvents = useCallback(() => {
    const targetDay = days[selectedDayOffset];
    if (!targetDay) return;

    if (activeTab === 'search') {
      const queried = queryEventsForDay(
        targetDay.dayString,
        searchLocation.lat,
        searchLocation.lng,
        50
      );
      setDayEvents(queried);
    } else {
      // My Events tab: all events user has RSVPed to or created
      const all = getAllEvents();
      const myEvents = all.filter(e => 
        e.creatorId === currentUser.id || 
        e.attendees?.some(a => a.id === currentUser.id || a.email === currentUser.email)
      );
      setDayEvents(myEvents);
    }
  }, [days, selectedDayOffset, searchLocation, activeTab, currentUser]);

  // Run query whenever day pill, search location, active tab, or user changes
  useEffect(() => {
    refreshDayEvents();
  }, [refreshDayEvents]);

  // Listen to WebMCP tool changes (e.g. when agent creates recurring events)
  useEffect(() => {
    const handleDataChange = () => {
      refreshDayEvents();
    };
    window.addEventListener('aktivelocal:datachange', handleDataChange);
    return () => window.removeEventListener('aktivelocal:datachange', handleDataChange);
  }, [refreshDayEvents]);

  // Client-Side Instant Zero-Latency Fuzzy Filtering
  const displayedEvents = useMemo(() => {
    return filterEventsInMemory(dayEvents, searchQuery);
  }, [dayEvents, searchQuery]);

  // Event Action Handlers
  const handleSaveEvent = async (eventPayload, eventId) => {
    if (eventId) {
      updateEvent(eventId, eventPayload, currentUser);
    } else {
      createEvent(eventPayload, currentUser);
    }
    refreshDayEvents();
  };

  const handleDeleteEvent = (eventId) => {
    deleteEvent(eventId, currentUser);
    refreshDayEvents();
  };

  const handleToggleRSVP = (eventId) => {
    toggleEventRSVP(eventId, currentUser);
    refreshDayEvents();
    // Update active modal event if open
    setModalState(prev => {
      if (prev.isOpen && prev.event && prev.event.id === eventId) {
        const all = getAllEvents();
        const updated = all.find(e => e.id === eventId);
        return { ...prev, event: updated || prev.event };
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* 1. Header (Logo, Tabs, Profile Trigger) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-4">
        
        {/* Search Bar with Map Pin (Available on Search Tab) */}
        {activeTab === 'search' && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchLocation={searchLocation}
            onLocationChange={handleLocationChange}
          />
        )}

        {/* Dynamic 7-Day Horizon Pills (Search Tab) */}
        {activeTab === 'search' && (
          <DayPills
            days={days}
            selectedDayOffset={selectedDayOffset}
            onSelectDay={setSelectedDayOffset}
          />
        )}

        {/* My Events Tab Header Banner */}
        {activeTab === 'my-events' && (
          <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-800/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>⭐</span>
                <span>My RSVPs & Hosted Events</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing all gatherings associated with <strong className="text-orange-400">{currentUser.displayName}</strong>
              </p>
            </div>
            <span className="text-xs bg-orange-500/20 text-orange-300 font-bold px-3 py-1 rounded-full border border-orange-500/30">
              {displayedEvents.length} Events
            </span>
          </div>
        )}

        {/* Event Feed (+ Create Event top card + 2-line minimalist cards) */}
        <EventList
          events={displayedEvents}
          searchLocation={searchLocation}
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectEvent={(evt) => setModalState({ isOpen: true, mode: 'read', event: evt })}
          onCreateEventClick={() => setModalState({ isOpen: true, mode: 'create', event: null })}
        />

      </main>

      {/* 3. Slide-out Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUserChanged={(updated) => {
          setCurrentUser(updated);
          refreshDayEvents();
        }}
      />

      {/* 4. Event Modal (Read / Create / Edit) */}
      <EventModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        event={modalState.event}
        currentUser={currentUser}
        searchLocation={searchLocation}
        onClose={() => setModalState({ isOpen: false, mode: 'read', event: null })}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        onToggleRSVP={handleToggleRSVP}
      />

      {/* 5. WebMCP AI Agent & Protocol Inspector Dock */}
      <WebMCPAgentDock />

    </div>
  );
}
