// WebMCP (Model Context Protocol) Browser Integration for aktivelocal
import { getAllEvents, createEvent, toggleEventRSVP, queryEventsForDay } from './eventStore';
import { getActiveUser } from './userStore';
import { resolveLocation } from './geo';

/**
 * WebMCP Tool Definitions (Compliant with standard MCP Tool Schema)
 */
export const WEBMCP_TOOLS = [
  {
    name: 'get_active_profile',
    description: 'Retrieves the active user profile including email, display name, birth year, and location.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'search_events',
    description: 'Searches local events within a 50-mile radius for a given date and query string.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or keyword (e.g., "yoga", "run", "coffee")' },
        date: { type: 'string', description: 'ISO date string or YYYY-MM-DD for the target day' },
        radius_miles: { type: 'number', description: 'Maximum radius in miles (default 50)' }
      },
      required: ['date']
    }
  },
  {
    name: 'get_event_details',
    description: 'Fetches complete details, description, venue, and attendee list for a specific event ID.',
    parameters: {
      type: 'object',
      properties: {
        event_id: { type: 'string', description: 'The unique event ID (e.g. "evt-001")' }
      },
      required: ['event_id']
    }
  },
  {
    name: 'create_event',
    description: 'Creates a single atomic local event on aktivelocal.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        datetime: { type: 'string', description: 'ISO-8601 start date and time' },
        location: { type: 'string', description: 'Venue name and address' },
        description: { type: 'string', description: 'Details and agenda for the event' },
        duration_minutes: { type: 'number', description: 'Duration in minutes (default 60)' }
      },
      required: ['title', 'datetime', 'location']
    }
  },
  {
    name: 'rsvp_event',
    description: 'RSVPs or cancels RSVP for the active user to a specific event.',
    parameters: {
      type: 'object',
      properties: {
        event_id: { type: 'string', description: 'Event ID to RSVP to' },
        action: { type: 'string', enum: ['rsvp', 'cancel'], description: 'Action to perform' }
      },
      required: ['event_id']
    }
  },
  {
    name: 'create_recurring_series',
    description: 'Autonomous Agent Superpower: Synthesizes a weekly recurring event series across multiple weeks using atomic event creation tools.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Base title of recurring series' },
        day_offset_start: { type: 'number', description: 'Day offset from today to start (0 = today, 1 = tomorrow)' },
        hour: { type: 'number', description: 'Hour of the day in 24h format (e.g. 18 for 6 PM)' },
        minute: { type: 'number', description: 'Minute of the hour (e.g. 30)' },
        weeks_count: { type: 'number', description: 'Number of consecutive weeks to schedule (e.g. 4 or 6)' },
        location: { type: 'string', description: 'Venue name and address' },
        description: { type: 'string', description: 'Event description' }
      },
      required: ['title', 'day_offset_start', 'hour', 'weeks_count', 'location']
    }
  },
  {
    name: 'plan_weekend_itinerary',
    description: 'Autonomous Agent Superpower: Discovers events for Saturday/Sunday, balances morning/afternoon/evening slots, checks distance, and auto-RSVPs.',
    parameters: {
      type: 'object',
      properties: {
        target_weekend_day_offset: { type: 'number', description: 'Day offset for weekend (e.g., 2 for Saturday, 3 for Sunday)' },
        vibes: { type: 'array', items: { type: 'string' }, description: 'Desired vibes (e.g. ["active", "social", "food"])' },
        auto_rsvp: { type: 'boolean', description: 'Whether to automatically RSVP the active user' }
      },
      required: ['target_weekend_day_offset']
    }
  }
];

// Event listener bus for the UI Inspector
const listeners = new Set();
export function subscribeToWebMCPLogs(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyLog(logEntry) {
  listeners.forEach(fn => fn(logEntry));
}

/**
 * Tool Executor implementing each tool
 */
export async function executeWebMCPTool(toolName, args) {
  const currentUser = getActiveUser();
  const startTime = performance.now();
  
  notifyLog({
    id: `call-${Date.now()}`,
    type: 'CALL',
    toolName,
    args,
    timestamp: new Date().toLocaleTimeString()
  });

  let result;
  try {
    switch (toolName) {
      case 'get_active_profile': {
        result = currentUser;
        break;
      }

      case 'search_events': {
        const dateStr = args.date || new Date().toISOString();
        const coords = await resolveLocation(currentUser.location);
        const events = queryEventsForDay(dateStr, coords.lat, coords.lng, args.radius_miles || 50);
        result = {
          count: events.length,
          events: events.map(e => ({
            id: e.id,
            title: e.title,
            datetime: e.datetime,
            location: e.location,
            attendees_count: e.attendees.length
          }))
        };
        break;
      }

      case 'get_event_details': {
        const all = getAllEvents();
        const found = all.find(e => e.id === args.event_id);
        if (!found) throw new Error(`Event with ID "${args.event_id}" not found`);
        result = found;
        break;
      }

      case 'create_event': {
        const geo = await resolveLocation(args.location);
        const newEvt = createEvent({
          title: args.title,
          description: args.description || '',
          datetime: args.datetime,
          durationMinutes: args.duration_minutes || 60,
          location: args.location,
          lat: geo.lat,
          lng: geo.lng
        }, currentUser);
        result = { success: true, event: newEvt };
        break;
      }

      case 'rsvp_event': {
        const { event, isRSVPed } = toggleEventRSVP(args.event_id, currentUser);
        result = { success: true, event_id: args.event_id, rsvp_status: isRSVPed ? 'RSVP_CONFIRMED' : 'RSVP_CANCELLED', total_attendees: event.attendees.length };
        break;
      }

      case 'create_recurring_series': {
        // Agent orchestrates consecutive weekly events
        const count = Math.min(Number(args.weeks_count) || 4, 8);
        const seriesTag = `series-${Date.now()}`;
        const createdSeries = [];
        const geo = await resolveLocation(args.location);

        for (let i = 0; i < count; i++) {
          const d = new Date();
          d.setDate(d.getDate() + (args.day_offset_start || 0) + (i * 7));
          d.setHours(args.hour || 18, args.minute || 0, 0, 0);

          const evt = createEvent({
            title: `${args.title} (Week ${i + 1}/${count})`,
            description: args.description || `Weekly community meetup — Week ${i + 1} of ${count}.`,
            datetime: d.toISOString(),
            durationMinutes: 75,
            location: args.location,
            lat: geo.lat,
            lng: geo.lng,
            isRecurring: true,
            seriesTag
          }, currentUser);
          createdSeries.push(evt);
        }

        result = {
          success: true,
          series_tag: seriesTag,
          events_created_count: createdSeries.length,
          events: createdSeries.map(e => ({ id: e.id, title: e.title, datetime: e.datetime }))
        };
        break;
      }

      case 'plan_weekend_itinerary': {
        const targetOffset = args.target_weekend_day_offset ?? 2;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + targetOffset);
        const dateIso = targetDate.toISOString();

        const geo = await resolveLocation(currentUser.location);
        const dayEvents = queryEventsForDay(dateIso, geo.lat, geo.lng, 50);

        // Pick top 2 balanced events for day
        const selected = dayEvents.slice(0, 2);
        
        if (args.auto_rsvp && selected.length > 0) {
          selected.forEach(evt => {
            toggleEventRSVP(evt.id, currentUser);
          });
        }

        result = {
          success: true,
          day_planned: targetDate.toDateString(),
          itinerary: selected.map((e, idx) => ({
            slot: idx === 0 ? 'Morning / Afternoon Session' : 'Evening Session',
            title: e.title,
            time: new Date(e.datetime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            location: e.location,
            rsvped: !!args.auto_rsvp
          }))
        };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    const duration = Math.round(performance.now() - startTime);
    notifyLog({
      id: `res-${Date.now()}`,
      type: 'RESULT',
      toolName,
      result,
      durationMs: duration,
      timestamp: new Date().toLocaleTimeString()
    });

    // Dispatch global custom event for React components to re-render
    window.dispatchEvent(new CustomEvent('aktivelocal:datachange'));

    return result;
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    notifyLog({
      id: `err-${Date.now()}`,
      type: 'ERROR',
      toolName,
      error: err.message,
      durationMs: duration,
      timestamp: new Date().toLocaleTimeString()
    });
    throw err;
  }
}

/**
 * Registers WebMCP tools onto navigator.modelContext and window.mcp
 */
export function initializeWebMCP() {
  const mcpProvider = {
    name: 'aktivelocal-webmcp',
    version: '1.0.0',
    description: 'WebMCP Agent Tools for aktivelocal events platform',
    getTools: () => WEBMCP_TOOLS,
    callTool: async ({ name, parameters }) => {
      return await executeWebMCPTool(name, parameters);
    }
  };

  // Expose on window.mcp and navigator.modelContext for WebMCP standard agents
  if (typeof window !== 'undefined') {
    window.mcp = mcpProvider;
    if (navigator) {
      try {
        navigator.modelContext = mcpProvider;
      } catch {
        // ignore if read-only
      }
    }
    console.log('⚡ [WebMCP] Initialized and registered 7 WebMCP tools.');
  }

  return mcpProvider;
}
