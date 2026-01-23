type Entry = {
    count: number;
    lastReset: number;
};

const WINDOW_MS = 60_000; //1 minute
const MAX_REQUESTS = 5;

const store = new Map<string, Entry>();

export function isRateLimited(ip: string) {
    const now = Date.now();
    const entry = store.get(ip);

    if(!entry) {
        store.set(ip, { count: 1, lastReset: now});
        return false;
    }

    if(now - entry.lastReset > WINDOW_MS) {
        entry.count = 1;
        entry.lastReset = now;
        return false;
    }

    entry.count++;

    return entry.count > MAX_REQUESTS;
}

const ALIAS_LIMIT = 3;
const ALIAS_WINDOW = 60 * 60 * 1000; //1 hour

const aliasStore = new Map<string, Entry>();

export function isAliasRateLimited(ip: string) {
    const now = Date.now();
    const entry = aliasStore.get(ip);

    if(!entry) {
        aliasStore.set(ip, { count: 1, lastReset: now });
        return false;
    }

    if(now - entry.lastReset > ALIAS_WINDOW) {
        entry.count = 1;
        entry.lastReset = now;
        return false;
    }

    entry.count++;

    return entry.count > ALIAS_LIMIT;
}