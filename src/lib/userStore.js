// User profile, personas, and avatar generator for aktivelocal

export const AVATAR_PRESETS = [
  { id: 'preset-1', name: 'Runner', seed: 'active-runner-01' },
  { id: 'preset-2', name: 'Yogi', seed: 'wellness-yogi-02' },
  { id: 'preset-3', name: 'Climber', seed: 'boulder-climber-03' },
  { id: 'preset-4', name: 'Cyclist', seed: 'trail-cyclist-04' },
  { id: 'preset-5', name: 'Creative', seed: 'creative-artist-05' },
  { id: 'preset-6', name: 'Builder', seed: 'tech-builder-06' },
  { id: 'preset-7', name: 'Explorer', seed: 'outdoor-explorer-07' },
  { id: 'preset-8', name: 'Social', seed: 'social-mixer-08' }
];

export const PRESET_PERSONAS = [
  {
    id: 'user-host-01',
    displayName: 'Alex Rivera',
    email: 'alex.host@aktivelocal.com',
    location: 'Seattle, WA (Downtown)',
    role: 'Host & Community Lead',
    avatarSeed: 'alex-rivera-organizer'
  },
  {
    id: 'user-judge-01',
    displayName: 'Devpost Judge',
    email: 'judge.devpost@aktivelocal.com',
    location: 'Seattle, WA',
    role: 'Hackathon Reviewer',
    avatarSeed: 'judge-reviewer-aktive'
  },
  {
    id: 'user-jordan-01',
    displayName: 'Jordan Lee',
    email: 'jordan.lee@example.com',
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
  return `https://api.dicebear.com/7.x/personas/svg?seed=${safeSeed}&size=400&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,c1f4c5`;
}

export function getRandomAvatarSeed() {
  const words = ['sun', 'wave', 'trail', 'mountain', 'coffee', 'star', 'spark', 'breeze', 'sky', 'river'];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${randomWord}-${randomNum}`;
}

/**
 * Checks if user has already set up their profile or saved one
 */
export function hasStoredUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      const parsed = JSON.parse(saved);
      return !!(parsed && parsed.id && parsed.email);
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Gets the current active user profile from localStorage or null if first time
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
  return null;
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
  const current = getActiveUser() || PRESET_PERSONAS[0];
  const updated = {
    ...current,
    ...updates,
    avatarSeed: updates.avatarSeed || updates.displayName || current.avatarSeed
  };
  saveActiveUser(updated);
  return updated;
}
