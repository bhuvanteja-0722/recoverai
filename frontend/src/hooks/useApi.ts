import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiState } from '../types';

export function useApi<T>(
  fetcher: () => Promise<T>,
  options?: { immediate?: boolean; emptyCheck?: (data: T) => boolean }
) {
  const [state, setState] = useState<ApiState<T>>({ state: 'idle' });
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setState({ state: 'loading' });
    try {
      const data = await fetcher();
      if (!mountedRef.current) return;

      const isEmpty = options?.emptyCheck ? options.emptyCheck(data) : false;
      setState(isEmpty ? { state: 'empty' } : { state: 'success', data });
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setState({ state: 'error', message });
    }
  }, [fetcher, options?.emptyCheck]);

  useEffect(() => {
    mountedRef.current = true;
    if (options?.immediate !== false) {
      fetch();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [fetch, options?.immediate]);

  return { state, refetch: fetch };
}
