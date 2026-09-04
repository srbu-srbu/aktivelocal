import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^POSTGRES_URL="?([^"\r\n]+)"?/);
    if (match) {
      connectionString = match[1];
      break;
    }
  }
}

if (!connectionString) {
  console.error('Missing POSTGRES_URL in .env.local or environment');
  process.exit(1);
}

const sql = neon(connectionString);

function getDateOffset(daysOffset, hours = 18, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return {
    date: d.toISOString().split('T')[0],
    time: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    datetime: d.toISOString()
  };
}

const BAY_AREA_EVENTS = [
  // SANTA CLARA
  {
    title: 'Central Park 5K Sunset Social Run & Smoothies',
    description: 'Casual community run around Central Park perimeter trail (all paces welcome, 9-11 min/mi). Post-run electrolytes and fruit smoothies near the community center lawn.',
    dayOffset: 0, hour: 18, minute: 30,
    location: 'Santa Clara Central Park, 909 Kiely Blvd, Santa Clara, CA',
    lat: 37.3489, lng: -121.9723,
    creatorId: 'user-host-01'
  },
  {
    title: 'Mission City Bouldering & Slice Night',
    description: 'Group climb at Movement Santa Clara followed by fresh wood-fired pizza and beers next door.',
    dayOffset: 1, hour: 19, minute: 0,
    location: 'Movement Santa Clara, 984 Walsh Ave, Santa Clara, CA',
    lat: 37.3621, lng: -121.9812,
    creatorId: 'user-jordan-01'
  },
  {
    title: 'Rivermark Village Morning Walk & Matcha Latte',
    description: 'Brisk 45-minute neighborhood stroll along the Guadalupe River Trail connection, ending with ceremonial matcha at Fantasia.',
    dayOffset: 2, hour: 8, minute: 30,
    location: 'Rivermark Village Plaza, 3929 Rivermark Plaza, Santa Clara, CA',
    lat: 37.3941, lng: -121.9472,
    creatorId: 'user-judge-01'
  },
  {
    title: 'Santa Clara University Grass Volleyball & Spikeball (Co-Ed)',
    description: 'Casual drop-in grass volleyball and spikeball quad courts. Bring sunscreen and water. Teams rotate every 15 minutes.',
    dayOffset: 3, hour: 16, minute: 0,
    location: 'SCU Stanton Field, 500 El Camino Real, Santa Clara, CA',
    lat: 37.3496, lng: -121.9390,
    creatorId: 'user-host-01'
  },
  {
    title: 'Triton Museum Lawn Sketch & Coffee Social',
    description: 'Informal open-air sketching, watercolor, and design hangout in the museum sculpture garden. Beginners welcome!',
    dayOffset: 5, hour: 10, minute: 30,
    location: 'Triton Museum of Art Grounds, 1505 Warburton Ave, Santa Clara, CA',
    lat: 37.3541, lng: -121.9482,
    creatorId: 'user-jordan-01'
  },

  // SAN JOSE
  {
    title: 'San Pedro Square Market AI Builders & Indie Founders Mixer',
    description: 'Casual outdoor evening meetup for software developers, founders, and AI hobbyists. Grab tacos and beer while discussing agentic workflows.',
    dayOffset: 0, hour: 18, minute: 0,
    location: 'San Pedro Square Market, 87 N San Pedro St, San Jose, CA',
    lat: 37.3364, lng: -121.8943,
    creatorId: 'user-jordan-01'
  },
  {
    title: 'Santana Row Sunset Flow Yoga in the Plaza',
    description: 'Vinyasa flow under the palm trees. Bring your mat or towel. Co-hosted by local certified instructors.',
    dayOffset: 1, hour: 17, minute: 30,
    location: 'Santana Row Park Valencia, 377 Santana Row, San Jose, CA',
    lat: 37.3218, lng: -121.9478,
    creatorId: 'user-host-01'
  },
  {
    title: 'Japantown Historical Ramen Stroll & Boba Chat',
    description: 'Explore historical Japantown, grab hot tonkotsu ramen at Daikokuya, and finish with freshly brewed boba milk tea.',
    dayOffset: 2, hour: 12, minute: 0,
    location: 'San Jose Japantown Square, 565 N 6th St, San Jose, CA',
    lat: 37.3486, lng: -121.8931,
    creatorId: 'user-judge-01'
  },
  {
    title: 'Guadalupe River Trail 15-Mile Casual Bike Cruise',
    description: 'No-drop group ride from downtown SJ up toward the bay shoreline and back. Road and hybrid bikes recommended.',
    dayOffset: 3, hour: 17, minute: 45,
    location: 'Guadalupe River Park Visitor Center, 438 Coleman Ave, San Jose, CA',
    lat: 37.3421, lng: -121.9056,
    creatorId: 'user-host-01'
  },
  {
    title: 'Almaden Quicksilver Historic Trail Hike (5 Miles)',
    description: 'Moderate loop trail with scenic hillside oak groves and old mining relics. Panoramic vistas of the Santa Clara Valley!',
    dayOffset: 4, hour: 9, minute: 0,
    location: 'Almaden Quicksilver County Park, 21785 Almaden Rd, San Jose, CA',
    lat: 37.2415, lng: -121.8672,
    creatorId: 'user-jordan-01'
  },
  {
    title: 'Communications Hill Sunset Golden Hour Walk & Photography',
    description: 'Stair climb workout and golden-hour sunset photography overlook above South San Jose.',
    dayOffset: 6, hour: 19, minute: 0,
    location: 'Communications Hill Grand View, Grand View Way, San Jose, CA',
    lat: 37.2892, lng: -121.8590,
    creatorId: 'user-host-01'
  },

  // MOUNTAIN VIEW
  {
    title: 'Castro Street Coffee & Code Morning Jam',
    description: 'Informal morning co-working and caffeine session at Red Rock Coffee. Bring your laptop and projects!',
    dayOffset: 0, hour: 8, minute: 0,
    location: 'Red Rock Coffee, 201 Castro St, Mountain View, CA',
    lat: 37.3940, lng: -122.0785,
    creatorId: 'user-host-01'
  },
  {
    title: 'Shoreline Lake Kayaking & Lakeside Picnic',
    description: 'Rent a pedal boat or kayak for a spin around the lake, followed by a relaxed picnic on the grassy shore.',
    dayOffset: 1, hour: 14, minute: 0,
    location: 'Shoreline Lake Boathouse, 3160 N Shoreline Blvd, Mountain View, CA',
    lat: 37.4302, lng: -122.0874,
    creatorId: 'user-judge-01'
  },
  {
    title: 'Rengstorff Park Open Pickleball Mixer (All Levels)',
    description: 'Friendly open-play pickleball on the dedicated courts. Extra paddles and balls available for first-timers.',
    dayOffset: 2, hour: 17, minute: 30,
    location: 'Rengstorff Park Pickleball Courts, 2011 S Rengstorff Ave, Mountain View, CA',
    lat: 37.4012, lng: -122.0991,
    creatorId: 'user-jordan-01'
  },
  {
    title: 'Stevens Creek Trail 8K Twilight Tempo Run',
    description: 'Smooth paved loop heading north toward the bay salt marshes. Paces from 7:30 to 10:30 min/mile.',
    dayOffset: 4, hour: 18, minute: 15,
    location: 'Stevens Creek Trailhead, Yuba Dr, Mountain View, CA',
    lat: 37.3789, lng: -122.0621,
    creatorId: 'user-host-01'
  },
  {
    title: 'Pioneer Park Board Games & Craft Brews on the Lawn',
    description: 'Outdoor strategy games (Catan, Wingspan, Codenames, Ticket to Ride). Cold drinks and snacks provided.',
    dayOffset: 5, hour: 15, minute: 0,
    location: 'Pioneer Park, 500 Castro St, Mountain View, CA',
    lat: 37.3897, lng: -122.0832,
    creatorId: 'user-jordan-01'
  },

  // MILPITAS
  {
    title: 'Ed R. Levin County Park Ridge Hike & Hang Glider Watch',
    description: 'Scenic ridge hike with breathtaking views of the Bay. Watch local paragliders launch while enjoying trail snacks.',
    dayOffset: 0, hour: 9, minute: 30,
    location: 'Ed R. Levin County Park, 3100 Calaveras Rd, Milpitas, CA',
    lat: 37.4485, lng: -121.8612,
    creatorId: 'user-jordan-01'
  },
  {
    title: 'Hidden Lake Park Evening Stroll & Birdwatching',
    description: 'Tranquil paved loop around the lake to watch egrets and herons as dusk settles. Family-friendly.',
    dayOffset: 1, hour: 18, minute: 45,
    location: 'Hidden Lake Park, 1150 N Abel St, Milpitas, CA',
    lat: 37.4452, lng: -121.9089,
    creatorId: 'user-judge-01'
  },
  {
    title: 'Milpitas Sports Center Intermediate Badminton Doubles',
    description: 'Indoor indoor court play with rotating doubles teams. Bring non-marking indoor court shoes.',
    dayOffset: 3, hour: 19, minute: 30,
    location: 'Milpitas Sports Center, 1325 E Calaveras Blvd, Milpitas, CA',
    lat: 37.4354, lng: -121.8845,
    creatorId: 'user-host-01'
  },
  {
    title: 'Cardoza Park Twilight Bocce & Food Truck Rally',
    description: 'Casual bocce ball under the string lights with gourmet food trucks parked along Kennedy Drive.',
    dayOffset: 4, hour: 17, minute: 30,
    location: 'Cardoza Park, Kennedy Dr, Milpitas, CA',
    lat: 37.4287, lng: -121.8995,
    creatorId: 'user-jordan-01'
  },
  {
    title: 'Pinewood Park Tennis Round Robin (Level 3.0+)',
    description: 'Friendly singles and doubles match play. Fresh Wilson US Open balls provided.',
    dayOffset: 6, hour: 10, minute: 0,
    location: 'Pinewood Park, Starlite Dr, Milpitas, CA',
    lat: 37.4241, lng: -121.8920,
    creatorId: 'user-host-01'
  },

  // SUNNYVALE
  {
    title: 'Historic Murphy Avenue Friday Street Food & Live Jazz',
    description: 'Pedestrian street dining, craft brews, artisan food stalls, and live outdoor jazz band performance.',
    dayOffset: 0, hour: 18, minute: 0,
    location: 'Historic Murphy Ave, 100 S Murphy Ave, Sunnyvale, CA',
    lat: 37.3772, lng: -122.0301,
    creatorId: 'user-host-01'
  },
  {
    title: 'Baylands Park Frisbee Golf & Sunset Meadow Picnic',
    description: 'Casual ultimate frisbee and disc golf in the wide open fields followed by blanket picnic.',
    dayOffset: 1, hour: 17, minute: 0,
    location: 'Baylands Park, 999 E Caribbean Dr, Sunnyvale, CA',
    lat: 37.4168, lng: -122.0125,
    creatorId: 'user-judge-01'
  },
  {
    title: 'Las Palmas Park Tennis & Island Tiki Pond Walk',
    description: 'Round of casual tennis matches followed by an easy stroll around the Polynesian-themed pond.',
    dayOffset: 2, hour: 16, minute: 30,
    location: 'Las Palmas Park, 850 S Bernardo Ave, Sunnyvale, CA',
    lat: 37.3592, lng: -122.0512,
    creatorId: 'user-jordan-01'
  },
  {
    title: 'Seven Seas Park Family Fun & Spikeball Tournament',
    description: 'Casual community lawn games, pirate splash area for kids, and friendly double-elimination spikeball.',
    dayOffset: 3, hour: 11, minute: 0,
    location: 'Seven Seas Park, 1010 Morse Ave, Sunnyvale, CA',
    lat: 37.3995, lng: -122.0152,
    creatorId: 'user-host-01'
  },
  {
    title: 'Washington Park Sunset Calisthenics & Fitness Boot Camp',
    description: 'Bodyweight fitness, pull-up bar drills, and core agility circuits suitable for all fitness levels.',
    dayOffset: 5, hour: 18, minute: 15,
    location: 'Washington Park, 840 W Washington Ave, Sunnyvale, CA',
    lat: 37.3712, lng: -122.0410,
    creatorId: 'user-jordan-01'
  },
  {
    title: 'Ortega Park Cricket Friendly & Masala Chai Chat',
    description: 'Recreational tape-ball cricket match and fresh cardamom masala chai for all players and spectators.',
    dayOffset: 6, hour: 15, minute: 0,
    location: 'Ortega Park, 636 Harrow Way, Sunnyvale, CA',
    lat: 37.3512, lng: -122.0298,
    creatorId: 'user-judge-01'
  }
];

async function seed() {
  console.log(`🚀 Seeding ${BAY_AREA_EVENTS.length} events across Santa Clara, San Jose, Mountain View, Milpitas, and Sunnyvale...`);

  let count = 0;
  for (const item of BAY_AREA_EVENTS) {
    const timing = getDateOffset(item.dayOffset, item.hour, item.minute);
    const eventId = `ev-bay-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

    await sql`
      INSERT INTO events (id, title, description, date, time, location_name, lat, lng, creator_id)
      VALUES (
        ${eventId}, 
        ${item.title}, 
        ${item.description}, 
        ${timing.date}, 
        ${timing.time}, 
        ${item.location}, 
        ${item.lat}, 
        ${item.lng}, 
        ${item.creatorId}
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    // Auto-RSVP the creator
    await sql`
      INSERT INTO event_rsvps (event_id, user_id)
      VALUES (${eventId}, ${item.creatorId})
      ON CONFLICT DO NOTHING;
    `;

    // Add some random realistic community RSVPs
    const extraUsers = ['user-host-01', 'user-judge-01', 'user-jordan-01'].filter(u => u !== item.creatorId);
    if (Math.random() > 0.4) {
      const luckyUser = extraUsers[Math.floor(Math.random() * extraUsers.length)];
      await sql`
        INSERT INTO event_rsvps (event_id, user_id)
        VALUES (${eventId}, ${luckyUser})
        ON CONFLICT DO NOTHING;
      `;
    }

    count++;
    console.log(`  ✓ [${count}/${BAY_AREA_EVENTS.length}] [${timing.date} ${timing.time}] ${item.title}`);
  }

  console.log(`\n🎉 Successfully seeded ${count} Bay Area events into Neon Postgres database!`);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
