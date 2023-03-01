import { useCallback, useState } from 'react';

type UseLocalStorage = <T>(key: string, initialValue: T) => [T, (arg0: T) => void]

export const useLocalStorage: UseLocalStorage = <T>(key: string, initialValue: T)  => {
  const [ state, setState ] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);

      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    try {
      setState(value);

      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // no-op
    }
  }, [ key ]);

  return [ state, setValue ];
};
