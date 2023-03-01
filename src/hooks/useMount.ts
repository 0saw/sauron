import { useEffect } from 'react';

export const useMount = (callback: VoidFunction) => {
  useEffect(() => {
    callback?.();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
};
