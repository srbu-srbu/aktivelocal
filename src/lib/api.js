// Unified API Client for Neon Postgres with Offline/Local Fallback
import { 
  getAllEvents, 
  saveAllEvents, 
  filterEventsInMemory 
} from './eventStore';
import { saveActiveUser } from './userStore';

/**
 * Fetch events from Neon Postgres backend (with fallback to local storage cache)
 */
export async function fetchEventsFromApi({ date, searchLocation, searchQuery, selectedTab, activeUser }) {
  try {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);

    const response = await fetch(`/api/events?${queryParams.toString()}`);
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.events)) {
        // Cache to localStorage for instantaneous UI updates
        saveAllEvents(data.events);
        return filterEventsInMemory(data.events, {
          selectedDate: date,
          searchLocation,
          searchQuery,
          selectedTab,
          activeUser
        });
      }
    }
  } catch (err) {
    console.warn('API fetch fallback to local cache:', err.message);
  }

  // Fallback to local store
  const localEvents = getAllEvents();
  return filterEventsInMemory(localEvents, {
    selectedDate: date,
    searchLocation,
    searchQuery,
    selectedTab,
    activeUser
  });
}

/**
 * Create event in Neon Postgres backend
 */
export async function createEventApi(eventData) {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (response.ok) {
      const data = await response.json();
      if (data.event) {
        // Update local cache
        const current = getAllEvents();
        const updated = [data.event, ...current];
        saveAllEvents(updated);
        return data.event;
      }
    }
  } catch (err) {
    console.warn('Create event API fallback to local store:', err.message);
  }

  // Fallback local creation
  const localId = `ev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const newEv = {
    ...eventData,
    id: localId,
    attendees: [
      {
        id: eventData.creatorId || 'user-host-01',
        displayName: 'You',
        avatarSeed: eventData.creatorId || 'user-host-01'
      }
    ],
    createdAt: new Date().toISOString()
  };
  const current = getAllEvents();
  saveAllEvents([newEv, ...current]);
  return newEv;
}

/**
 * Update event in Neon Postgres backend
 */
export async function updateEventApi(eventData) {
  try {
    const response = await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (response.ok) {
      const data = await response.json();
      if (data.event) {
        const current = getAllEvents();
        const updated = current.map(e => e.id === data.event.id ? { ...e, ...data.event } : e);
        saveAllEvents(updated);
        return data.event;
      }
    }
  } catch (err) {
    console.warn('Update event API fallback to local store:', err.message);
  }

  const current = getAllEvents();
  const updated = current.map(e => e.id === eventData.id ? { ...e, ...eventData } : e);
  saveAllEvents(updated);
  return eventData;
}

/**
 * Delete event in Neon Postgres backend
 */
export async function deleteEventApi(eventId, userId) {
  try {
    const response = await fetch('/api/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: eventId, userId })
    });
    if (response.ok) {
      const current = getAllEvents();
      const updated = current.filter(e => e.id !== eventId);
      saveAllEvents(updated);
      return true;
    }
  } catch (err) {
    console.warn('Delete event API fallback to local store:', err.message);
  }

  const current = getAllEvents();
  const updated = current.filter(e => e.id !== eventId);
  saveAllEvents(updated);
  return true;
}

/**
 * Toggle RSVP in Neon Postgres backend
 */
export async function toggleRsvpApi(eventId, activeUser) {
  const current = getAllEvents();
  const target = current.find(e => e.id === eventId);
  if (!target) return null;

  const isGoing = target.attendees?.some(a => a.id === activeUser.id);
  const action = isGoing ? 'remove' : 'add';

  try {
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        userId: activeUser.id,
        action
      })
    });
  } catch (err) {
    console.warn('RSVP API fallback:', err.message);
  }

  // Update local cache
  let newAttendees = target.attendees ? [...target.attendees] : [];
  if (isGoing) {
    newAttendees = newAttendees.filter(a => a.id !== activeUser.id);
  } else {
    newAttendees.push({
      id: activeUser.id,
      displayName: activeUser.displayName,
      avatarSeed: activeUser.avatarSeed || activeUser.displayName
    });
  }

  const updatedTarget = { ...target, attendees: newAttendees };
  const updatedEvents = current.map(e => e.id === eventId ? updatedTarget : e);
  saveAllEvents(updatedEvents);
  return updatedTarget;
}

/**
 * Email passwordless identity authentication
 */
export async function authenticateWithEmail(emailData) {
  try {
    const response = await fetch('/api/auth/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        saveActiveUser(data.user);
        return data.user;
      }
    }
  } catch (err) {
    console.warn('Identity API fallback:', err.message);
  }

  // Local fallback
  const fallbackUser = {
    id: `user-${Date.now().toString(36)}`,
    displayName: emailData.displayName || emailData.email.split('@')[0],
    email: emailData.email,
    location: emailData.location || 'Seattle, WA',
    role: 'Active Member',
    avatarSeed: emailData.avatarSeed || emailData.displayName || emailData.email
  };
  saveActiveUser(fallbackUser);
  return fallbackUser;
}
