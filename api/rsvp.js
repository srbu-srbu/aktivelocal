// Neon Postgres RSVP API
import { getDb, ensureSchema } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureSchema();
    const sql = getDb();

    const { eventId, userId, action } = req.body || {};

    if (!eventId || !userId) {
      return res.status(400).json({ error: 'eventId and userId are required' });
    }

    if (req.method === 'POST') {
      if (action === 'remove' || req.query.action === 'remove') {
        await sql`
          DELETE FROM event_rsvps 
          WHERE event_id = ${eventId} AND user_id = ${userId};
        `;
        return res.status(200).json({ success: true, isGoing: false });
      }

      // Add RSVP
      await sql`
        INSERT INTO event_rsvps (event_id, user_id)
        VALUES (${eventId}, ${userId})
        ON CONFLICT (event_id, user_id) DO NOTHING;
      `;

      return res.status(200).json({ success: true, isGoing: true });
    }

    if (req.method === 'DELETE') {
      await sql`
        DELETE FROM event_rsvps 
        WHERE event_id = ${eventId} AND user_id = ${userId};
      `;
      return res.status(200).json({ success: true, isGoing: false });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('RSVP endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
