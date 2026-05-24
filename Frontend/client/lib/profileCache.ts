export type CachedProfile<T> = T & { uid: string };

const CACHE_PREFIX = "ai-resume-profile:";

function getKey(uid: string) {
  return `${CACHE_PREFIX}${uid}`;
}

export function readProfileCache<T extends { uid: string }>(uid: string): T | null {
  if (!uid || typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getKey(uid));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeProfileCache<T extends { uid: string }>(profile: T) {
  if (!profile?.uid || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getKey(profile.uid), JSON.stringify(profile));
  } catch {
    // Ignore storage failures (quota, privacy mode, etc.).
  }
}

export function clearProfileCache(uid: string) {
  if (!uid || typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getKey(uid));
  } catch {
    // Ignore storage failures.
  }
}
