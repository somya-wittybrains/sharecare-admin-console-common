import { useState, useEffect } from 'react';
import { useAppModelStore } from 'model/hooks';

const excludeNullReplacer = (_, value) => (value === null ? undefined : value);

const buildOptions = ({ method = 'POST', params, body, ...options }) => {
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    return {
      method,
      params,
      body: JSON.stringify(body, excludeNullReplacer),
      ...options
    };
  } else if (method === 'GET') {
    return { method, params, body: null, ...options };
  } else {
    return { method, params, body, ...options };
  }
};

const useFetch = (url, options) => {
  const { restStore } = useAppModelStore();
  const [opts, setOpts] = useState(options);
  const [{ resolved, rejected, pending }, setResult] = useState({
    rejected: undefined,
    resolved: undefined,
    pending: undefined
  });
  let controller = new window.AbortController();

  const { method, preemptiveAbort = true, params, body } = buildOptions(opts);
  const fetchUrl = new URL(url, window.location.origin);
  if (params) {
    fetchUrl.search = String(new URLSearchParams(params));
  }

  useEffect(() => {
    if (opts.immediate === false) {
      return;
    }
    if (pending && preemptiveAbort) {
      controller.abort();
      // This is an exception to not block CRA update (CN-577). Do not duplicate. Properly fix this instead.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      controller = new window.AbortController();
    }
    setResult({ pending: true });
    restStore
      .fetch(fetchUrl, {
        method,
        body,
        skip401: opts.skip401 || false,
        signal: controller.signal
      })
      .then(
        resolved => {
          setResult({ pending: false, resolved });
        },
        rejected => {
          setResult({
            pending: false,
            rejected
          });
        }
      );
    return () => {
      if (preemptiveAbort) {
        controller.abort();
      }
    };
  }, [url, opts]);

  const refetch = update => {
    const { opts: newOptions } = evolve(
      { opts },
      { opts: applyUpdate(update) }
    );
    setOpts({ ...newOptions, immediate: true });
  };

  const reget = update => {
    return refetch(opts => evolve(opts, { params: applyUpdate(update) }));
  };

  const repost = update => {
    return refetch(opts => evolve(opts, { body: applyUpdate(update) }));
  };

  return {
    resolved,
    rejected,
    pending,
    refetch,
    reget,
    repost
  };
};

export default useFetch;

export const applyReplace = update => obj =>
  typeof update === 'function' ? update(obj) : update;

export const applyUpdate = update => (obj = {}) =>
  applyReplace(update || { ...obj })(obj);

// Applies a map of functions to object members.
// Functions have to be under the key of the member they will be applied to.
export const evolve = (reference = {}, fnMap = {}) => {
  for (const [key, fn] of Object.entries(fnMap)) {
    reference[key] = fn(reference[key]);
  }
  return reference;
};
