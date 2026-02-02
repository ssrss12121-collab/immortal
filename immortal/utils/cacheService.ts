const cache: Record<string, { data: any, timestamp: number }> = {};
const DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const getCachedData = (key: string) => {
    const entry = cache[key];
    if (entry && Date.now() - entry.timestamp < DEFAULT_CACHE_DURATION) {
        console.log(`[Cache] Hit: ${key}`);
        return entry.data;
    }
    console.log(`[Cache] Miss: ${key}`);
    return null;
};

export const setCachedData = (key: string, data: any) => {
    cache[key] = { data, timestamp: Date.now() };
    console.log(`[Cache] Set: ${key}`);
};

export const invalidateCache = (key?: string) => {
    if (key) {
        delete cache[key];
        console.log(`[Cache] Invalidated: ${key}`);
    } else {
        Object.keys(cache).forEach(k => delete cache[k]);
        console.log(`[Cache] Flushed`);
    }
};
