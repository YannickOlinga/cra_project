const DEFAULT_LIMIT = 5;
const DEFAULT_LOCK_MS = 2 * 60 * 1000;

function readEntry(key) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? {};
  } catch {
    localStorage.removeItem(key);
    return {};
  }
}

function writeEntry(key, entry) {
  localStorage.setItem(key, JSON.stringify(entry));
}

export function getRateLimitRemainingSeconds(key) {
  const entry = readEntry(key);
  const lockedUntil = Number(entry.lockedUntil ?? 0);
  const remainingMs = lockedUntil - Date.now();

  if (remainingMs <= 0) {
    if (lockedUntil) {
      localStorage.removeItem(key);
    }
    return 0;
  }

  return Math.ceil(remainingMs / 1000);
}

export function recordRateLimitAttempt(
  key,
  { limit = DEFAULT_LIMIT, lockMs = DEFAULT_LOCK_MS } = {},
) {
  const remainingSeconds = getRateLimitRemainingSeconds(key);
  if (remainingSeconds > 0) {
    return remainingSeconds;
  }

  const entry = readEntry(key);
  const attempts = Number(entry.attempts ?? 0) + 1;

  if (attempts >= limit) {
    const lockedUntil = Date.now() + lockMs;
    writeEntry(key, { attempts: 0, lockedUntil });
    return Math.ceil(lockMs / 1000);
  }

  writeEntry(key, { attempts, lockedUntil: 0 });
  return 0;
}

export function clearRateLimit(key) {
  localStorage.removeItem(key);
}

export function formatRateLimitTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}
