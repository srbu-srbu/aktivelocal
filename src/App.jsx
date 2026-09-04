import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarCheck2 } from 'lucide-react';
import Header from './components/Header';
import ProfileDrawer from './components/ProfileDrawer';
import SearchBar from './components/SearchBar';
import DayPills, { generateSevenDays } from './components/DayPills';
import EventList from './components/EventList';
import EventModal from './components/EventModal';
import OnboardingModal from './components/OnboardingModal';
import WebMCPAgentDock from './components/WebMCPAgentDock';

import { getActiveUser, hasStoredUser, PRESET_PERSONAS } from './lib/userStore';
import { 
  filterEventsInMemory 
} from './lib/eventStore';
import { 
  fetchEventsFromApi, 
  createEventApi, 
  updateEventApi, 
  deleteEventApi, 
  toggleRsvpApi 
} from './lib/api';
import { DEFAULT_SEARCH_LOCATION } from './lib/geo';
import { initializeWebMCP } from './lib/webmcp';

const STORAGE_KEY_SEARCH_LOC = 'aktivelocal_search_loc_v1';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'my-events'
  
  // User Profile & First-Time Onboarding State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !hasStoredUser());
  const [currentUser, setCurrentUser] = useState(() => getActiveUser() || PRESET_PERSONAS[0]);
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

  // Database Query for Selected Day & 50-Mile Radius via Neon API / local cache
  const refreshDayEvents = useCallback(async () => {
    const targetDay = days[selectedDayOffset];
    if (!targetDay) return;

    const events = await fetchEventsFromApi({
      date: activeTab === 'search' ? targetDay.dayString : undefined,
      searchLocation,
      searchQuery,
      selectedTab: activeTab,
      activeUser: currentUser
    });
    setDayEvents(events);
  }, [days, selectedDayOffset, searchLocation, searchQuery, activeTab, currentUser]);

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

  // Event Action Handlers with Neon API integration
  const handleSaveEvent = async (eventPayload, eventId) => {
    if (eventId) {
      await updateEventApi({
        ...eventPayload,
        id: eventId,
        userId: currentUser.id
      });
    } else {
      await createEventApi({
        ...eventPayload,
        creatorId: currentUser.id
      });
    }
    refreshDayEvents();
  };

  const handleDeleteEvent = async (eventId) => {
    await deleteEventApi(eventId, currentUser.id);
    refreshDayEvents();
  };

  const handleToggleRSVP = async (eventId) => {
    const updated = await toggleRsvpApi(eventId, currentUser);
    refreshDayEvents();
    // Update active modal event if open
    setModalState(prev => {
      if (prev.isOpen && prev.event && prev.event.id === eventId) {
        return { ...prev, event: updated || prev.event };
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col relative selection:bg-cyan-500 selection:text-white font-sans">
      
      {/* Subtle Ambient Radial Lighting */}
      <div className="ambient-glow" />

      {/* 1. Header (Logo, Segmented Tabs, Profile Trigger) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 space-y-4 relative z-10">
        
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
          <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  My RSVPs & Hosted Events
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing events for <strong className="text-orange-600">{currentUser.displayName}</strong>
                </p>
              </div>
            </div>
            <span className="text-xs bg-orange-50 text-orange-700 font-bold px-3 py-1 rounded-full border border-orange-200 shadow-sm">
              {displayedEvents.length} {displayedEvents.length === 1 ? 'Event' : 'Events'}
            </span>
          </div>
        )}

        {/* Event Feed (+ Create Event top card + 2-line cards) */}
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

      {/* 5. First-Time User Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={(user) => {
          setCurrentUser(user);
          setIsOnboardingOpen(false);
          refreshDayEvents();
        }}
      />

      {/* 6. WebMCP AI Agent & Protocol Inspector Dock */}
      <WebMCPAgentDock />

    </div>
  );
}
