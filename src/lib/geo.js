// Geography, distance calculation, reverse geocoding, and location resolvers for aktivelocal

// Fallback common coordinates database for instant offline/zero-API failure resolution
export const CITY_COORDINATES = {
  // Seattle area default
  'seattle': { name: 'Seattle, WA', zip: '98101', lat: 47.6062, lng: -122.3321 },
  '98101': { name: 'Seattle, WA (Downtown)', zip: '98101', lat: 47.6062, lng: -122.3321 },
  '98102': { name: 'Seattle, WA (Capitol Hill)', zip: '98102', lat: 47.6339, lng: -122.3216 },
  '98103': { name: 'Seattle, WA (Fremont/Green Lake)', zip: '98103', lat: 47.6734, lng: -122.3426 },
  '98109': { name: 'Seattle, WA (South Lake Union)', zip: '98109', lat: 47.6318, lng: -122.3486 },
  '98004': { name: 'Bellevue, WA', zip: '98004', lat: 47.6101, lng: -122.2015 },
  'redmond': { name: 'Redmond, WA', zip: '98052', lat: 47.6740, lng: -122.1215 },
  'kirkland': { name: 'Kirkland, WA', zip: '98033', lat: 47.6769, lng: -122.2060 },
  
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
 * Reverse geocodes a latitude & longitude into a human-readable city, state, and zip.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'aktivelocal-events-app/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || 'Local Area';
        const state = addr.state_code || addr.state || '';
        const zip = addr.postcode || 'GPS';
        const name = state ? `${city}, ${state}` : city;
        
        return {
          name,
          zip,
          lat: Number(lat),
          lng: Number(lng),
          formattedAddress: data.display_name || name
        };
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding error:', err.message);
  }

  // Fallback: estimate from coordinates or default
  return {
    name: 'Current Location',
    zip: 'GPS',
    lat: Number(lat),
    lng: Number(lng)
  };
}

/**
 * Live address & venue autocomplete suggestion search
 */
export async function searchAddressSuggestions(query) {
  if (!query || query.trim().length < 2) return [];

  const cleaned = query.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleaned)}&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'aktivelocal-events-app/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((item, idx) => {
          const parts = (item.display_name || '').split(',').map(s => s.trim());
          const mainText = parts[0] || item.name || cleaned;
          const secondaryText = parts.slice(1, 4).join(', ');

          return {
            id: item.place_id || `place-${idx}`,
            displayName: item.display_name,
            mainText,
            secondaryText: secondaryText || mainText,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          };
        });
      }
    }
  } catch (err) {
    console.warn('Address suggestion search error:', err.message);
  }

  // Fallback offline suggestions
  const lower = cleaned.toLowerCase();
  const matchedOffline = Object.keys(CITY_COORDINATES)
    .filter(k => k.includes(lower) || CITY_COORDINATES[k].name.toLowerCase().includes(lower))
    .slice(0, 3)
    .map((k, idx) => {
      const c = CITY_COORDINATES[k];
      return {
        id: `offline-${idx}`,
        displayName: c.name,
        mainText: c.name,
        secondaryText: `ZIP: ${c.zip}`,
        lat: c.lat,
        lng: c.lng
      };
    });

  return matchedOffline;
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

  // Attempt online geocoding via OpenStreetMap Nominatim with fast 2.5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      { 
        signal: controller.signal, 
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'aktivelocal-events-app/1.0'
        } 
      }
    );
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const item = data[0];
        const addr = item.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || item.display_name.split(',')[0];
        const state = addr.state_code || addr.state || '';
        const name = state ? `${city}, ${state}` : city;
        const zip = addr.postcode || query.replace(/\D/g, '').slice(0, 5) || 'Local';

        return {
          name,
          zip,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        };
      }
    }
  } catch {
    // Network / timeout fallback
  }

  // Safe fallback if not found
  return {
    name: query.trim(),
    zip: 'Local',
    lat: DEFAULT_SEARCH_LOCATION.lat,
    lng: DEFAULT_SEARCH_LOCATION.lng
  };
}

/**
 * Browser Geolocation helper with real reverse-geocoded City/State
 */
export function getUserCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_SEARCH_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const geocoded = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          resolve(geocoded);
        } catch {
          resolve({
            name: 'Current Location',
            zip: 'GPS',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        }
      },
      () => {
        // Fallback if user denies permission
        resolve(DEFAULT_SEARCH_LOCATION);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  });
}
