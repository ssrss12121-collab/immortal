import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

/**
 * Hook for optimistic data fetching with local cache fallback
 * @param url API endpoint
 * @param cacheKey Storage key for local persistence
 */
export function useOptimisticFetch<T>(url: string, cacheKey: string) {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    // Load from local storage first (Optimistic)
    useEffect(() => {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setState(prev => ({ ...prev, data: JSON.parse(cached), loading: false }));
        }
    }, [cacheKey]);

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const json = await response.json();

            // Update local storage and state
            localStorage.setItem(cacheKey, JSON.stringify(json));
            setState({ data: json, loading: false, error: null });
        } catch (err: any) {
            setState(prev => ({ ...prev, loading: false, error: err.message }));
        }
    }, [url, cacheKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...state, refetch: fetchData };
}
