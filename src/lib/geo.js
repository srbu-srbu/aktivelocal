// Geography, distance calculation, and location resolvers for aktivelocal

// Fallback common coordinates database for instant offline/zero-API failure resolution
export const CITY_COORDINATES = {
  // Seattle area default
  'seattle': { name: 'Seattle, WA', zip: '98101', lat: 47.6062, lng: -122.3321 },
  '98101': { name: 'Seattle, WA (Downtown)', zip: '98101', lat: 47.6062, lng: -122.3321 },
  '98102': { name: 'Seattle, WA (Capitol Hill)', zip: '98102', lat: 47.6339, lng: -122.3216 },
  '98103': { name: 'Seattle, WA (Fremont/Green Lake)', zip: '98103', lat: 47.6734, lng: -122.3426 },
  '98109': { name: 'Seattle, WA (South Lake Union)', zip: '98109', lat: 47.6318, lng: -122.3486 },
  '98004': { name: 'Bellevue, WA', zip: '98004', lat: 47.6101, lng: -122.2015 },
  
  // San Francisco Bay Area
  'san francisco': { name: 'San Francisco, CA', zip: '94102', lat: 37.7749, lng: -122.4194 },
  '94102': { name: 'San Francisco, CA', zip: '94102', lat: 37.7749, lng: -122.4194 },
  '94107': { name: 'San Francisco, CA (SOMA)', zip: '94107', lat: 37.7699, lng: -122.3985 },
  
  // New York
  'new york': { name: 'New York, NY', zip: '10001', lat: 40.7128, lng: -74.0060 },
  '10001': { name: 'New York, NY (Manhattan)', zip: '10001', lat: 40.7501, lng: -73.9967 },
  
  // Austin
  'austin': { name: 'Austin, TX', zip: '78701', lat: 30.2672, lng: -97.7431 },
  '78701': { name: 'Austin, TX (Downtown)', zip: '78701', lat: 30.2672, lng: -97.7431 },

  // Los Angeles
  'los angeles': { name: 'Los Angeles, CA', zip: '90012', lat: 34.0522, lng: -118.2437 },
  '90012': { name: 'Los Angeles, CA (Downtown)', zip: '90012', lat: 34.0522, lng: -118.2437 },

  // Chicago
  'chicago': { name: 'Chicago, IL', zip: '60601', lat: 41.8781, lng: -87.6298 },
  '60601': { name: 'Chicago, IL (The Loop)', zip: '60601', lat: 41.8781, lng: -87.6298 },
};

export const DEFAULT_SEARCH_LOCATION = {
  name: 'Seattle, WA',
  zip: '98101',
  lat: 47.6062,
  lng: -122.3321
};

/**
 * Calculates the Haversine distance in miles between two lat/lng coordinates.
 */
export function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Formats distance nicely (e.g., "1.2 mi away" or "0.4 mi away")
 */
export function formatDistance(miles) {
  if (miles === undefined || miles === null || isNaN(miles)) return 'Nearby';
  if (miles < 0.1) return '< 0.1 mi';
  return `${miles} mi`;
}

/**
 * Resolves a zip code or city string to coordinates and a display name.
 */
export async function resolveLocation(query) {
  if (!query || typeof query !== 'string') return DEFAULT_SEARCH_LOCATION;
  const cleaned = query.trim().toLowerCase();

  // Check instant offline dictionary
  if (CITY_COORDINATES[cleaned]) {
    return CITY_COORDINATES[cleaned];
  }

  // Quick 5-digit zip check
  const zipMatch = cleaned.match(/\b\d{5}\b/);
  if (zipMatch && CITY_COORDINATES[zipMatch[0]]) {
    return CITY_COORDINATES[zipMatch[0]];
  }

  // Attempt online geocoding via OpenStreetMap Nominatim with fast 2s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { signal: controller.signal, headers: { 'Accept': 'application/json' } }
    );
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          name: data[0].display_name.split(',').slice(0, 2).join(','),
          zip: query.replace(/\D/g, '').slice(0, 5) || 'Local',
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    }
  } catch {
    // Network / timeout fallback
  }

  // Safe fallback if not found
  return {
    name: query.toUpperCase(),
    zip: 'Local',
    lat: DEFAULT_SEARCH_LOCATION.lat,
    lng: DEFAULT_SEARCH_LOCATION.lng
  };
}

/**
 * Browser Geolocation helper with fallback
 */
export function getUserCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_SEARCH_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          name: 'Current Location',
          zip: 'Current GPS',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {
        // Fallback if user denies permission
        resolve(DEFAULT_SEARCH_LOCATION);
      },
      { timeout: 5000 }
    );
  });
}
