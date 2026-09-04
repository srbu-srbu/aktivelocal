// User profile and persona store for aktivelocal

export const PRESET_PERSONAS = [
  {
    id: 'user-host-01',
    displayName: 'Alex Rivera',
    email: 'alex.host@aktivelocal.com',
    birthYear: 1994,
    location: 'Seattle, WA (Downtown)',
    role: 'Host & Community Lead',
    avatarSeed: 'alex-rivera-organizer'
  },
  {
    id: 'user-judge-01',
    displayName: 'Devpost Judge',
    email: 'judge.devpost@aktivelocal.com',
    birthYear: 1996,
    location: 'Seattle, WA',
    role: 'Hackathon Reviewer',
    avatarSeed: 'judge-reviewer-aktive'
  },
  {
    id: 'user-jordan-01',
    displayName: 'Jordan Lee',
    email: 'jordan.lee@example.com',
    birthYear: 1998,
    location: 'Seattle, WA (Capitol Hill)',
    role: 'Active Runner & Foodie',
    avatarSeed: 'jordan-lee-outdoors'
  }
];

const STORAGE_KEY_USER = 'aktivelocal_active_user_v1';

/**
 * Returns deterministic high-resolution 400x400 SVG Avatar URL from DiceBear
 */
export function getAvatarUrl(seed = 'aktivelocal-user') {
  const safeSeed = encodeURIComponent(seed || 'aktivelocal');
  // High polish modern personas style with soft vibrant background colors
  return `https://api.dicebear.com/7.x/personas/svg?seed=${safeSeed}&size=400&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,c1f4c5`;
}

/**
 * Gets the current active user profile from localStorage or defaults to Judge persona
 */
export function getActiveUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id) return parsed;
    }
  } catch {
    // ignore parsing errors
  }
  // Default to Host persona for first run so pre-populated events match creator
  const defaultUser = PRESET_PERSONAS[0];
  saveActiveUser(defaultUser);
  return defaultUser;
}

/**
 * Saves active user profile to localStorage
 */
export function saveActiveUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save active user:', err);
  }
}

/**
 * Updates specific fields on the current active user
 */
export function updateActiveUserProfile(updates) {
  const current = getActiveUser();
  const updated = {
    ...current,
    ...updates,
    avatarSeed: updates.displayName || updates.email || current.avatarSeed
  };
  saveActiveUser(updated);
  return updated;
}
