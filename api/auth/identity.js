// Email-Based Passwordless Identity Endpoint
import { getDb, ensureSchema } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureSchema();
    const sql = getDb();

    // GET: lookup user by email or ID
    if (req.method === 'GET') {
      const { email, id } = req.query;

      if (!email && !id) {
        return res.status(400).json({ error: 'Missing email or id parameter' });
      }

      let users = [];
      if (email) {
        users = await sql`
          SELECT id, email, display_name as "displayName", 
                 location, role, avatar_seed as "avatarSeed", created_at as "createdAt"
          FROM users 
          WHERE LOWER(email) = LOWER(${email.trim()})
          LIMIT 1;
        `;
      } else if (id) {
        users = await sql`
          SELECT id, email, display_name as "displayName", 
                 location, role, avatar_seed as "avatarSeed", created_at as "createdAt"
          FROM users 
          WHERE id = ${id}
          LIMIT 1;
        `;
      }

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found', exists: false });
      }

      return res.status(200).json({ user: users[0], exists: true });
    }

    // POST: Authenticate or Register passwordless user
    if (req.method === 'POST') {
      const { email, displayName, location, role, avatarSeed } = req.body || {};

      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if user already exists
      const existing = await sql`
        SELECT id, email, display_name as "displayName", 
               location, role, avatar_seed as "avatarSeed", created_at as "createdAt"
        FROM users 
        WHERE LOWER(email) = ${normalizedEmail}
        LIMIT 1;
      `;

      if (existing.length > 0) {
        // Returning user authenticated! If update fields provided, update profile
        if (displayName || location || avatarSeed) {
          const updated = await sql`
            UPDATE users
            SET 
              display_name = COALESCE(${displayName}, display_name),
              location = COALESCE(${location}, location),
              avatar_seed = COALESCE(${avatarSeed || displayName}, avatar_seed)
            WHERE id = ${existing[0].id}
            RETURNING id, email, display_name as "displayName", 
                      location, role, avatar_seed as "avatarSeed", created_at as "createdAt";
          `;
          return res.status(200).json({ user: updated[0], isNewUser: false });
        }
        return res.status(200).json({ user: existing[0], isNewUser: false });
      }

      // Create new passwordless user
      const newId = `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const cleanName = displayName || normalizedEmail.split('@')[0];
      const cleanLocation = location || 'Seattle, WA';
      const cleanRole = role || 'Active Member';
      const cleanSeed = avatarSeed || cleanName;

      const created = await sql`
        INSERT INTO users (id, email, display_name, location, role, avatar_seed)
        VALUES (${newId}, ${normalizedEmail}, ${cleanName}, ${cleanLocation}, ${cleanRole}, ${cleanSeed})
        RETURNING id, email, display_name as "displayName", 
                  location, role, avatar_seed as "avatarSeed", created_at as "createdAt";
      `;

      return res.status(201).json({ user: created[0], isNewUser: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Identity endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
