import { useCallback, useEffect, useRef, useState } from 'react';
import { useMount } from './useMount';

type Resource<Result, Params extends any[]> = (...args: Params) => Promise<Result>
type Options<Params extends any[]> = {
  manual?: boolean;
  params?: Params;
}

export const useRequest = <Result, Params extends any[]>(
  resource: Resource<Result, Params>,
  options: Options<Params> = {},
) => {
  const {
    manual = false,
    params = [],
  } = options;

  const [ loading, setLoading ] = useState(!manual);
  const [ error, setError ] = useState<Error | null>(null);
  const [ data, setData ] = useState<Result | null>(null);
  const resourceRef = useRef(resource);
  const paramsRef = useRef(params);

  const run = useCallback(async (...passedParams: any[]) => {
    setLoading(true);

    try {
      // @ts-ignore
      const newData = await resourceRef.current(...(passedParams.length > 0 ? passedParams : paramsRef.current));

      setData(newData);
      console.log(newData);

      return newData;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      setData(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, [ resourceRef, paramsRef ]);

  const clear = useCallback(() => {
    setData(null);
  }, []);

  useMount(() => {
    if (!manual) {
      run();
    }
  });

  useEffect(() => {
    paramsRef.current = params;
  }, [ params ]);

  useEffect(() => {
    resourceRef.current = resource;
  }, [ resource ]);

  return {
    loading,
    data,
    error,
    run,
    clear,
  };
};
