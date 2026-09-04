// Database bootstrap and health check
import { ensureSchema, getDb } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureSchema();
    const sql = getDb();
    const usersCount = await sql`SELECT COUNT(*)::int as count FROM users;`;
    const eventsCount = await sql`SELECT COUNT(*)::int as count FROM events;`;
    const rsvpsCount = await sql`SELECT COUNT(*)::int as count FROM event_rsvps;`;

    return res.status(200).json({
      status: 'ok',
      database: 'Neon Postgres',
      usersCount: usersCount[0].count,
      eventsCount: eventsCount[0].count,
      rsvpsCount: rsvpsCount[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Init DB error:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message,
      hint: 'Ensure POSTGRES_URL environment variable is set in Vercel Storage.'
    });
  }
}
