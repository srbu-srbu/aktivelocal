// Event Data Engine and In-Memory 50-Mile Radius Query Processor for aktivelocal
import { calculateDistanceMiles } from './geo';

const STORAGE_KEY_EVENTS = 'aktivelocal_events_v1';
const HOST_ID = 'user-host-01';

/**
 * Generates an ISO date string for Day offset from today
 */
function getDateOffset(daysOffset, hours = 18, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/**
 * Rich realistic initial seed events across the 7-day horizon
 */
export const INITIAL_SEED_EVENTS = [
  // Day 0 (Today)
  {
    id: 'evt-001',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Sunset 5K Social Run & Post-Run Brews',
    description: 'Casual 5K loop along Elliott Bay trail. All paces welcome (9-12 min/mile pacers included). We grab drinks at Fremont Brewing right after!',
    datetime: getDateOffset(0, 18, 30), // Today 6:30 PM
    durationMinutes: 75,
    location: 'Olympic Sculpture Park, 2901 Western Ave, Seattle, WA',
    lat: 47.6166,
    lng: -122.3553,
    attendees: [
      { id: 'user-02', displayName: 'Marcus Vance', email: 'marcus@example.com', avatarSeed: 'marcus' },
      { id: 'user-03', displayName: 'Elena Rostova', email: 'elena@example.com', avatarSeed: 'elena' },
      { id: 'user-04', displayName: 'David Kim', email: 'david@example.com', avatarSeed: 'david' },
      { id: 'user-05', displayName: 'Chloe Bennett', email: 'chloe@example.com', avatarSeed: 'chloe' },
      { id: 'user-06', displayName: 'Samira Patel', email: 'samira@example.com', avatarSeed: 'samira' }
    ]
  },
  {
    id: 'evt-002',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Downtown Indie Coffee & Tech Builders Social',
    description: 'Informal morning meetup for developers, designers, and AI founders. Grab an espresso, share what you are building, and bounce ideas.',
    datetime: getDateOffset(0, 8, 30), // Today 8:30 AM
    durationMinutes: 90,
    location: 'Victrola Coffee Roasters, 300 Pine St, Seattle, WA',
    lat: 47.6115,
    lng: -122.3364,
    attendees: [
      { id: 'user-07', displayName: 'Jason Wu', email: 'jason@example.com', avatarSeed: 'jason' },
      { id: 'user-08', displayName: 'Sarah Jenkins', email: 'sarah@example.com', avatarSeed: 'sarah' }
    ]
  },
  {
    id: 'evt-003',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Bouldering & Pizza Night @ Seattle Bouldering Project',
    description: 'Group climb at SBP Poplar. Free chalk refills and $5 draft beers for the group afterwards at the upstairs lounge!',
    datetime: getDateOffset(0, 19, 0), // Today 7:00 PM
    durationMinutes: 120,
    location: 'Seattle Bouldering Project, 900 Poplar Pl S, Seattle, WA',
    lat: 47.5936,
    lng: -122.3168,
    attendees: [
      { id: 'user-09', displayName: 'Travis Scott', email: 'travis@example.com', avatarSeed: 'travis' },
      { id: 'user-10', displayName: 'Maya Lin', email: 'maya@example.com', avatarSeed: 'maya' },
      { id: 'user-11', displayName: 'Liam O\'Connor', email: 'liam@example.com', avatarSeed: 'liam' }
    ]
  },

  // Day 1 (Tomorrow)
  {
    id: 'evt-004',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Capitol Hill Board Games & Craft Cider',
    description: 'Weekly casual board game mixer. We bring Catan, Wingspan, Secret Hitler, and Codenames. Beginners very welcome!',
    datetime: getDateOffset(1, 19, 0), // Tomorrow 7:00 PM
    durationMinutes: 150,
    location: 'Schilling Cider House, 708 N 34th St, Seattle, WA',
    lat: 47.6499,
    lng: -122.3497,
    attendees: [
      { id: 'user-12', displayName: 'Zack Taylor', email: 'zack@example.com', avatarSeed: 'zack' },
      { id: 'user-13', displayName: 'Hannah Schmidt', email: 'hannah@example.com', avatarSeed: 'hannah' },
      { id: 'user-14', displayName: 'Devon Miles', email: 'devon@example.com', avatarSeed: 'devon' },
      { id: 'user-15', displayName: 'Nina Gomez', email: 'nina@example.com', avatarSeed: 'nina' }
    ]
  },
  {
    id: 'evt-005',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Sunrise Flow Yoga on Alki Beach',
    description: 'Gentle Vinyasa flow as the sun rises over Puget Sound. Bring your own mat or towel. Hot herbal tea provided.',
    datetime: getDateOffset(1, 7, 0), // Tomorrow 7:00 AM
    durationMinutes: 60,
    location: 'Alki Beach Park, 1702 Alki Ave SW, Seattle, WA',
    lat: 47.5815,
    lng: -122.4055,
    attendees: [
      { id: 'user-16', displayName: 'Emma Watson', email: 'emma@example.com', avatarSeed: 'emma' },
      { id: 'user-17', displayName: 'Olivia Perez', email: 'olivia@example.com', avatarSeed: 'olivia' }
    ]
  },

  // Day 2 (Saturday)
  {
    id: 'evt-006',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Ballard Farmers Market Stroll & Brunch',
    description: 'Explore the lively Ballard Sunday market stalls for artisan cheeses, warm pastries, and fresh flowers before grabbing brunch.',
    datetime: getDateOffset(2, 10, 30),
    durationMinutes: 120,
    location: 'Ballard Ave NW, 5300 Ballard Ave NW, Seattle, WA',
    lat: 47.6669,
    lng: -122.3831,
    attendees: [
      { id: 'user-18', displayName: 'Lucas Silva', email: 'lucas@example.com', avatarSeed: 'lucas' },
      { id: 'user-19', displayName: 'Sophie Martin', email: 'sophie@example.com', avatarSeed: 'sophie' },
      { id: 'user-20', displayName: 'Arthur Pendelton', email: 'arthur@example.com', avatarSeed: 'arthur' },
      { id: 'user-21', displayName: 'Kelly Green', email: 'kelly@example.com', avatarSeed: 'kelly' }
    ]
  },
  {
    id: 'evt-007',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Discovery Park Coastal Trail Hike (4 Miles)',
    description: 'Moderate loop trail to the West Point Lighthouse and beach bluffs. Beautiful Olympic Mountain views!',
    datetime: getDateOffset(2, 14, 0),
    durationMinutes: 150,
    location: 'Discovery Park Visitor Center, 3801 Discovery Park Blvd, Seattle, WA',
    lat: 47.6575,
    lng: -122.4057,
    attendees: [
      { id: 'user-22', displayName: 'Brandon Lee', email: 'brandon@example.com', avatarSeed: 'brandon' },
      { id: 'user-23', displayName: 'Valerie Adams', email: 'valerie@example.com', avatarSeed: 'valerie' },
      { id: 'user-24', displayName: 'Tariq Al-Mansoor', email: 'tariq@example.com', avatarSeed: 'tariq' }
    ]
  },
  {
    id: 'evt-008',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Secret Vinyl Listening Party & Natural Wines',
    description: 'Intimate listening session playing classic funk, Japanese city pop, and rare soul on analog turntable systems.',
    datetime: getDateOffset(2, 20, 0),
    durationMinutes: 180,
    location: 'Life on Mars, 722 E Pike St, Seattle, WA',
    lat: 47.6141,
    lng: -122.3223,
    attendees: [
      { id: 'user-25', displayName: 'Nico Bellic', email: 'nico@example.com', avatarSeed: 'nico' },
      { id: 'user-26', displayName: 'Camille Dupont', email: 'camille@example.com', avatarSeed: 'camille' }
    ]
  },

  // Day 3 (Sunday)
  {
    id: 'evt-009',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Green Lake Co-Ed Volleyball Pickups',
    description: 'Recreational grass volleyball by the lake. 2 courts set up. Beginners and intermediate players all welcome!',
    datetime: getDateOffset(3, 11, 0),
    durationMinutes: 120,
    location: 'Green Lake East Beach, 7201 E Green Lake Dr N, Seattle, WA',
    lat: 47.6812,
    lng: -122.3312,
    attendees: [
      { id: 'user-27', displayName: 'Daniel Craig', email: 'daniel@example.com', avatarSeed: 'daniel' },
      { id: 'user-28', displayName: 'Rachel Green', email: 'rachel@example.com', avatarSeed: 'rachel' },
      { id: 'user-29', displayName: 'Ben Wyatt', email: 'ben@example.com', avatarSeed: 'ben' }
    ]
  },
  {
    id: 'evt-010',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Ceramics & Clay Handbuilding Workshop',
    description: 'Make your own mug or planter. Clay, glazes, and kiln firing included in this relaxed community studio session.',
    datetime: getDateOffset(3, 15, 30),
    durationMinutes: 120,
    location: 'Saltstone Ceramics, 2205 N 45th St, Seattle, WA',
    lat: 47.6611,
    lng: -122.3308,
    attendees: [
      { id: 'user-30', displayName: 'Alice Young', email: 'alice@example.com', avatarSeed: 'alice' },
      { id: 'user-31', displayName: 'Gabe Newell', email: 'gabe@example.com', avatarSeed: 'gabe' }
    ]
  },

  // Day 4
  {
    id: 'evt-011',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Monday Night Trivia & Taco Feasts',
    description: 'High energy pop culture and general trivia showdown. Teams of 4-6. Tacos on special all night!',
    datetime: getDateOffset(4, 19, 30),
    durationMinutes: 120,
    location: 'Rhein Haus, 912 12th Ave, Seattle, WA',
    lat: 47.6111,
    lng: -122.3168,
    attendees: [
      { id: 'user-32', displayName: 'Penny Hofstadter', email: 'penny@example.com', avatarSeed: 'penny' },
      { id: 'user-33', displayName: 'Leonard Leakey', email: 'leonard@example.com', avatarSeed: 'leonard' }
    ]
  },

  // Day 5
  {
    id: 'evt-012',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'AI Agent Architecture & MCP Meetup',
    description: 'Deep dive into Model Context Protocol (MCP), WebMCP standards, and browser-native agent orchestration with live lightning demos.',
    datetime: getDateOffset(5, 18, 0),
    durationMinutes: 120,
    location: 'Amazon Doppler, 2021 7th Ave, Seattle, WA',
    lat: 47.6154,
    lng: -122.3387,
    attendees: [
      { id: 'user-34', displayName: 'Geoffrey Hinton', email: 'geoff@example.com', avatarSeed: 'geoff' },
      { id: 'user-35', displayName: 'Andrej Karpathy', email: 'andrej@example.com', avatarSeed: 'andrej' },
      { id: 'user-36', displayName: 'Ilya Sutskever', email: 'ilya@example.com', avatarSeed: 'ilya' }
    ]
  },

  // Day 6
  {
    id: 'evt-013',
    creatorId: HOST_ID,
    creatorName: 'Alex Rivera',
    title: 'Pike Place Night Food Market Crawl',
    description: 'Taste chowder samples, warm mini donuts, artisan chocolates, and fresh ciders under the iconic neon clock.',
    datetime: getDateOffset(6, 18, 30),
    durationMinutes: 120,
    location: 'Pike Place Market Clock, 85 Pike St, Seattle, WA',
    lat: 47.6097,
    lng: -122.3422,
    attendees: [
      { id: 'user-37', displayName: 'Gordon Ramsay', email: 'gordon@example.com', avatarSeed: 'gordon' },
      { id: 'user-38', displayName: 'Matty Matheson', email: 'matty@example.com', avatarSeed: 'matty' }
    ]
  }
];

/**
 * Loads all events from localStorage or seeds initial set
 */
export function getAllEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading localStorage events:', err);
  }

  // First run seeding
  saveAllEvents(INITIAL_SEED_EVENTS);
  return INITIAL_SEED_EVENTS;
}

/**
 * Saves all events array to localStorage
 */
export function saveAllEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Error saving events to localStorage:', err);
  }
}

/**
 * Queries events for a given target Day String (YYYY-MM-DD) within maxRadiusMiles
 */
export function queryEventsForDay(targetDayString, searchLat, searchLng, maxRadiusMiles = 50) {
  const allEvents = getAllEvents();
  
  return allEvents.filter(event => {
    // 1. Match day string
    const eventDayStr = new Date(event.datetime).toISOString().split('T')[0];
    if (eventDayStr !== targetDayString) return false;

    // 2. Check 50-mile radius
    const distance = calculateDistanceMiles(searchLat, searchLng, event.lat, event.lng);
    return distance <= maxRadiusMiles;
  });
}

/**
 * Client-Side Instant Zero-Latency In-Memory Fuzzy Filter
 */
export function filterEventsInMemory(eventsList, searchQuery) {
  if (!searchQuery || !searchQuery.trim()) return eventsList;
  const q = searchQuery.toLowerCase().trim();

  return eventsList.filter(evt => {
    const titleMatch = evt.title.toLowerCase().includes(q);
    const descMatch = (evt.description || '').toLowerCase().includes(q);
    const locationMatch = (evt.location || '').toLowerCase().includes(q);
    const creatorMatch = (evt.creatorName || '').toLowerCase().includes(q);
    return titleMatch || descMatch || locationMatch || creatorMatch;
  });
}

/**
 * Creates a new event
 */
export function createEvent(eventData, currentUser) {
  const all = getAllEvents();
  const newEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    creatorId: currentUser.id,
    creatorName: currentUser.displayName,
    title: eventData.title.trim(),
    description: eventData.description ? eventData.description.trim() : '',
    datetime: eventData.datetime,
    durationMinutes: Number(eventData.durationMinutes) || 60,
    location: eventData.location.trim(),
    lat: Number(eventData.lat) || 47.6062,
    lng: Number(eventData.lng) || -122.3321,
    attendees: [
      {
        id: currentUser.id,
        displayName: currentUser.displayName,
        email: currentUser.email,
        avatarSeed: currentUser.avatarSeed
      }
    ],
    isRecurring: !!eventData.isRecurring,
    seriesTag: eventData.seriesTag || null,
    createdAt: new Date().toISOString()
  };

  const updated = [newEvent, ...all];
  saveAllEvents(updated);
  return newEvent;
}

/**
 * Updates an existing event (Creator only)
 */
export function updateEvent(eventId, updates, currentUser) {
  const all = getAllEvents();
  const index = all.findIndex(e => e.id === eventId);
  if (index === -1) throw new Error('Event not found');

  const existing = all[index];
  if (existing.creatorId !== currentUser.id) {
    throw new Error('Unauthorized: Only the creator can edit this event');
  }

  const updatedEvent = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  all[index] = updatedEvent;
  saveAllEvents(all);
  return updatedEvent;
}

/**
 * Deletes an existing event (Creator only)
 */
export function deleteEvent(eventId, currentUser) {
  const all = getAllEvents();
  const existing = all.find(e => e.id === eventId);
  if (!existing) return;
  
  if (existing.creatorId !== currentUser.id) {
    throw new Error('Unauthorized: Only the creator can delete this event');
  }

  const filtered = all.filter(e => e.id !== eventId);
  saveAllEvents(filtered);
}

/**
 * Toggles RSVP state for current user
 */
export function toggleEventRSVP(eventId, currentUser) {
  const all = getAllEvents();
  const event = all.find(e => e.id === eventId);
  if (!event) throw new Error('Event not found');

  const existingIndex = event.attendees.findIndex(a => a.id === currentUser.id || a.email === currentUser.email);
  let isRSVPed = false;

  if (existingIndex >= 0) {
    // Remove RSVP
    event.attendees.splice(existingIndex, 1);
    isRSVPed = false;
  } else {
    // Add RSVP
    event.attendees.push({
      id: currentUser.id,
      displayName: currentUser.displayName,
      email: currentUser.email,
      avatarSeed: currentUser.avatarSeed
    });
    isRSVPed = true;
  }

  saveAllEvents(all);
  return { event, isRSVPed };
}
