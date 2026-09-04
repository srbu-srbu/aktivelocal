// Neon Postgres Database Client & Schema Initializer
import { neon } from '@neondatabase/serverless';

export function getDatabaseUrl() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

export function getDb() {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error(
      'Missing POSTGRES_URL or DATABASE_URL environment variable. Please connect Neon in Vercel Storage.'
    );
  }
  return neon(connectionString);
}

let schemaInitialized = false;

/**
 * Initializes database tables and seed records if they do not exist.
 */
export async function ensureSchema() {
  if (schemaInitialized) return;
  const sql = getDb();

  // 1. Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      display_name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      role VARCHAR(100),
      avatar_seed VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      date VARCHAR(32) NOT NULL,
      time VARCHAR(64) NOT NULL,
      location_name VARCHAR(255) NOT NULL,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      creator_id VARCHAR(64),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS event_rsvps (
      id SERIAL PRIMARY KEY,
      event_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, user_id)
    );
  `;

  // 2. Ensure initial seed users
  const existingUsers = await sql`SELECT COUNT(*)::int as count FROM users;`;
  if (existingUsers[0].count === 0) {
    await sql`
      INSERT INTO users (id, email, display_name, location, role, avatar_seed)
      VALUES 
        ('user-host-01', 'alex.host@aktivelocal.com', 'Alex Rivera', 'Seattle, WA (Downtown)', 'Host & Community Lead', 'alex-rivera-organizer'),
        ('user-judge-01', 'judge.devpost@aktivelocal.com', 'Devpost Judge', 'Seattle, WA', 'Hackathon Reviewer', 'judge-reviewer-aktive'),
        ('user-jordan-01', 'jordan.lee@example.com', 'Jordan Lee', 'Seattle, WA (Capitol Hill)', 'Active Runner & Foodie', 'jordan-lee-outdoors')
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  // 3. Ensure initial seed events with dynamic offsets
  const existingEvents = await sql`SELECT COUNT(*)::int as count FROM events;`;
  if (existingEvents[0].count === 0) {
    const today = new Date();
    const formatDate = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const seedList = [
      {
        id: 'seed-01',
        title: 'Sunset 5K Social Run & Refreshments',
        description: 'Casual community run around Lake Union loop (all paces welcome, 9-11 min/mi avg). Post-run electrolytes and smoothies at the waterfront park!',
        date: formatDate(0),
        time: '6:30 PM - 7:45 PM',
        location_name: 'Lake Union Park, Seattle, WA',
        lat: 47.6275,
        lng: -122.3365,
        creator_id: 'user-host-01'
      },
      {
        id: 'seed-02',
        title: 'Intermediate Tennis Round Robin (Level 3.5+)',
        description: 'Friendly doubles match play and serving drills. Bring your own racquet, fresh Wilson balls provided.',
        date: formatDate(0),
        time: '7:00 PM - 8:30 PM',
        location_name: 'Amy Yee Tennis Center, Seattle, WA',
        lat: 47.5855,
        lng: -122.2985,
        creator_id: 'user-jordan-01'
      },
      {
        id: 'seed-03',
        title: 'Morning Flow Vinyasa Yoga on the Grass',
        description: 'Energizing 60-min outdoor flow focusing on mobility and breathwork. Bring your own mat or towel.',
        date: formatDate(1),
        time: '8:00 AM - 9:00 AM',
        location_name: 'Gas Works Park, Seattle, WA',
        lat: 47.6456,
        lng: -122.3344,
        creator_id: 'user-host-01'
      },
      {
        id: 'seed-04',
        title: 'Gravel & Road Group Ride (20 Miles)',
        description: 'No-drop group ride along the Burke-Gilman Trail toward Kenmore and back. Helmets required.',
        date: formatDate(1),
        time: '5:30 PM - 7:00 PM',
        location_name: 'Burke-Gilman Trailhead, Fremont, WA',
        lat: 47.6515,
        lng: -122.3510,
        creator_id: 'user-jordan-01'
      },
      {
        id: 'seed-05',
        title: 'Open Pickup Beach Volleyball (2x2 & 4x4)',
        description: 'Drop-in recreational and intermediate sand volleyball. Rotating teams after every set.',
        date: formatDate(2),
        time: '2:00 PM - 5:00 PM',
        location_name: 'Alki Beach Volleyball Courts, Seattle, WA',
        lat: 47.5802,
        lng: -122.4080,
        creator_id: 'user-host-01'
      },
      {
        id: 'seed-06',
        title: 'Saturday Discovery: Discovery Park Trail Hike',
        description: 'Scenic 4.5-mile loop through coastal forest down to the historic West Point Lighthouse.',
        date: formatDate(3),
        time: '10:00 AM - 12:30 PM',
        location_name: 'Discovery Park Visitor Center, Seattle, WA',
        lat: 47.6575,
        lng: -122.4055,
        creator_id: 'user-host-01'
      },
      {
        id: 'seed-07',
        title: 'Sunset Bouldering & Coffee Social',
        description: 'Climbing session followed by local espresso tasting. Beginners to V5 climbers welcome.',
        date: formatDate(4),
        time: '4:00 PM - 6:30 PM',
        location_name: 'Seattle Bouldering Project, Poplar St',
        lat: 47.5940,
        lng: -122.3160,
        creator_id: 'user-jordan-01'
      }
    ];

    for (const ev of seedList) {
      await sql`
        INSERT INTO events (id, title, description, date, time, location_name, lat, lng, creator_id)
        VALUES (${ev.id}, ${ev.title}, ${ev.description}, ${ev.date}, ${ev.time}, ${ev.location_name}, ${ev.lat}, ${ev.lng}, ${ev.creator_id})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // Add initial seed RSVPs
    await sql`
      INSERT INTO event_rsvps (event_id, user_id)
      VALUES 
        ('seed-01', 'user-host-01'),
        ('seed-01', 'user-jordan-01'),
        ('seed-02', 'user-jordan-01'),
        ('seed-03', 'user-host-01'),
        ('seed-06', 'user-host-01')
      ON CONFLICT DO NOTHING;
    `;
  }

  schemaInitialized = true;
}
