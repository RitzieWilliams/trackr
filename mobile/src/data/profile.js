import 'expo-sqlite/localStorage/install';

// Name and goal/tagline are kept on the device, same as the web app's localStorage profile
const KEY = 'trackrProfile';

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { name: '', goal: '', ...JSON.parse(raw) };
  } catch {}
  return { name: '', goal: '' };
}

export function saveProfile(profile) {
  try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch {}
}
