// Neon Postgres Events API
import { getDb, ensureSchema } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureSchema();
    const sql = getDb();

    // 1. GET: Fetch events
    if (req.method === 'GET') {
      const { date, id } = req.query;

      if (id) {
        const events = await sql`
          SELECT 
            e.id, e.title, e.description, e.date, e.time, 
            e.location_name as "locationName", e.lat, e.lng, 
            e.creator_id as "creatorId", e.created_at as "createdAt",
            u.display_name as "creatorName", u.avatar_seed as "creatorAvatarSeed"
          FROM events e
          LEFT JOIN users u ON e.creator_id = u.id
          WHERE e.id = ${id}
          LIMIT 1;
        `;

        if (events.length === 0) {
          return res.status(404).json({ error: 'Event not found' });
        }

        const rsvps = await sql`
          SELECT u.id, u.display_name as "displayName", u.avatar_seed as "avatarSeed"
          FROM event_rsvps r
          JOIN users u ON r.user_id = u.id
          WHERE r.event_id = ${id};
        `;

        return res.status(200).json({
          event: {
            ...events[0],
            attendees: rsvps
          }
        });
      }

      // Fetch all events or by date
      let eventsQuery;
      if (date) {
        eventsQuery = await sql`
          SELECT 
            e.id, e.title, e.description, e.date, e.time, 
            e.location_name as "locationName", e.lat, e.lng, 
            e.creator_id as "creatorId", e.created_at as "createdAt",
            u.display_name as "creatorName", u.avatar_seed as "creatorAvatarSeed"
          FROM events e
          LEFT JOIN users u ON e.creator_id = u.id
          WHERE e.date = ${date}
          ORDER BY e.created_at ASC;
        `;
      } else {
        eventsQuery = await sql`
          SELECT 
            e.id, e.title, e.description, e.date, e.time, 
            e.location_name as "locationName", e.lat, e.lng, 
            e.creator_id as "creatorId", e.created_at as "createdAt",
            u.display_name as "creatorName", u.avatar_seed as "creatorAvatarSeed"
          FROM events e
          LEFT JOIN users u ON e.creator_id = u.id
          ORDER BY e.date ASC, e.created_at ASC;
        `;
      }

      // Fetch all RSVPs to attach to events
      const allRsvps = await sql`
        SELECT r.event_id as "eventId", u.id, u.display_name as "displayName", u.avatar_seed as "avatarSeed"
        FROM event_rsvps r
        JOIN users u ON r.user_id = u.id;
      `;

      const rsvpMap = {};
      for (const r of allRsvps) {
        if (!rsvpMap[r.eventId]) rsvpMap[r.eventId] = [];
        rsvpMap[r.eventId].push({
          id: r.id,
          displayName: r.displayName,
          avatarSeed: r.avatarSeed
        });
      }

      const formattedEvents = eventsQuery.map(ev => {
        let isoDatetime = null;
        if (ev.date) {
          try {
            // If date is YYYY-MM-DD
            isoDatetime = new Date(`${ev.date}T18:00:00`).toISOString();
          } catch {
            isoDatetime = `${ev.date}T18:00:00.000Z`;
          }
        }
        return {
          ...ev,
          location: ev.locationName || 'Seattle, WA',
          datetime: isoDatetime || new Date().toISOString(),
          durationMinutes: 60,
          attendees: rsvpMap[ev.id] || []
        };
      });

      return res.status(200).json({ events: formattedEvents });
    }

    // 2. POST: Create Event
    if (req.method === 'POST') {
      const { 
        title, 
        description, 
        date, 
        time, 
        datetime, 
        location, 
        locationName, 
        lat, 
        lng, 
        creatorId 
      } = req.body || {};

      let eventDate = date;
      let eventTime = time;

      if (datetime) {
        try {
          const d = new Date(datetime);
          if (!isNaN(d.getTime())) {
            if (!eventDate) eventDate = d.toISOString().split('T')[0];
            if (!eventTime) eventTime = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          }
        } catch {
          // ignore
        }
      }

      if (!title || (!eventDate && !datetime)) {
        return res.status(400).json({ error: 'Title and Date/Datetime are required' });
      }

      const finalDate = eventDate || new Date().toISOString().split('T')[0];
      const finalTime = eventTime || '6:00 PM';
      const eventId = `ev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const cleanLat = lat ? Number(lat) : 47.6062;
      const cleanLng = lng ? Number(lng) : -122.3321;
      const cleanLocationName = locationName || location || 'Seattle, WA';
      const cleanCreatorId = creatorId || 'user-host-01';

      const inserted = await sql`
        INSERT INTO events (id, title, description, date, time, location_name, lat, lng, creator_id)
        VALUES (${eventId}, ${title}, ${description || ''}, ${finalDate}, ${finalTime}, ${cleanLocationName}, ${cleanLat}, ${cleanLng}, ${cleanCreatorId})
        RETURNING id, title, description, date, time, location_name as "locationName", lat, lng, creator_id as "creatorId", created_at as "createdAt";
      `;

      // Auto-RSVP the creator
      await sql`
        INSERT INTO event_rsvps (event_id, user_id)
        VALUES (${eventId}, ${cleanCreatorId})
        ON CONFLICT DO NOTHING;
      `;

      const creator = await sql`
        SELECT id, display_name as "displayName", avatar_seed as "avatarSeed"
        FROM users WHERE id = ${cleanCreatorId} LIMIT 1;
      `;

      const createdEvent = {
        ...inserted[0],
        location: inserted[0].locationName,
        datetime: datetime || `${finalDate}T18:00:00.000Z`,
        durationMinutes: 60,
        attendees: creator.length > 0 ? [creator[0]] : []
      };

      return res.status(201).json({ event: createdEvent });
    }

    // 3. PUT: Update Event
    if (req.method === 'PUT') {
      const { 
        id, 
        title, 
        description, 
        date, 
        time, 
        datetime, 
        location, 
        locationName, 
        lat, 
        lng, 
        userId 
      } = req.body || {};

      if (!id) {
        return res.status(400).json({ error: 'Event id is required' });
      }

      const existing = await sql`SELECT creator_id FROM events WHERE id = ${id} LIMIT 1;`;
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check permission if userId passed
      if (userId && existing[0].creator_id && existing[0].creator_id !== userId) {
        return res.status(403).json({ error: 'Only the event creator can edit this event' });
      }

      let eventDate = date;
      let eventTime = time;
      if (datetime) {
        try {
          const d = new Date(datetime);
          if (!isNaN(d.getTime())) {
            if (!eventDate) eventDate = d.toISOString().split('T')[0];
            if (!eventTime) eventTime = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          }
        } catch {
          // ignore
        }
      }

      const cleanLocationName = locationName || location || null;

      const updated = await sql`
        UPDATE events
        SET 
          title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          date = COALESCE(${eventDate}, date),
          time = COALESCE(${eventTime}, time),
          location_name = COALESCE(${cleanLocationName}, location_name),
          lat = COALESCE(${lat ? Number(lat) : null}, lat),
          lng = COALESCE(${lng ? Number(lng) : null}, lng)
        WHERE id = ${id}
        RETURNING id, title, description, date, time, location_name as "locationName", lat, lng, creator_id as "creatorId", created_at as "createdAt";
      `;

      const returnedEvent = {
        ...updated[0],
        location: updated[0].locationName,
        datetime: datetime || (updated[0].date ? `${updated[0].date}T18:00:00.000Z` : new Date().toISOString()),
        durationMinutes: 60
      };

      return res.status(200).json({ event: returnedEvent });
    }

    // 4. DELETE: Delete Event
    if (req.method === 'DELETE') {
      const { id, userId } = req.body || req.query || {};

      if (!id) {
        return res.status(400).json({ error: 'Event id is required' });
      }

      const existing = await sql`SELECT creator_id FROM events WHERE id = ${id} LIMIT 1;`;
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (userId && existing[0].creator_id && existing[0].creator_id !== userId) {
        return res.status(403).json({ error: 'Only the event creator can delete this event' });
      }

      await sql`DELETE FROM events WHERE id = ${id};`;
      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Events endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
