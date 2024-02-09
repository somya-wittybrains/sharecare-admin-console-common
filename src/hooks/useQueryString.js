import { isString, isNumber, fromPairs } from 'lodash';

const marshallValue = v =>
  // encoding happens automatically with URLSearchParams
  // encodeURIComponent(isString(v) ? v : JSON.stringify(v));
  isString(v) ? v : JSON.stringify(v);

const unmarshallValue = str => {
  const decoded = decodeURIComponent(str);
  try {
    if(!!str && !isNaN(Number(decoded))) {
      return Number(decoded);
    }
    if(isString(decoded)) {
      return decoded;
    }
    
    if (`${decoded}` === 'true' || `${decoded}` === 'false') {
      return `${decoded}` === 'true' ? true : false;
    }
    return  JSON.parse(decoded);
  } catch (error) {
    return JSON.parse(`'${decoded}'`);
  }
};

const unmarshallValueClosestToString = str => {
  const decoded = decodeURIComponent(str);
  try {
    return  isString(decoded) ||  isNumber(decoded) ? `${decoded}` :  JSON.parse(decoded);
  } catch (error) {
    return JSON.parse(`'${decoded}'`);
  }
};

const toSearchParams = params => {
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) searchParams.set(k, marshallValue(v));
  }
  return searchParams;
};

const fromSearchParams = searchParams => {
  const params = {};
  for (const [k, v] of searchParams.entries()) {
    params[k] = unmarshallValue(v);
  }
  return params;
};

const fromSearchParamsToClosestString = searchParams => {
  const params = {};
  for (const [k, v] of searchParams.entries()) {
    params[k] = unmarshallValueClosestToString(v);
  }
  return params;
};

// TODO use useEffect for perf optimization
export default function useQueryString ({ history, location, match: { url } }) {
  const replaceQueryString = params =>
    history.replace({
      path: url,
      search: toSearchParams(params).toString(),
      hash: location.hash
    });

  const updateQueryString = params => {
    // simpler but requires setting up polyfills for jest
    // const oldParams = Object.fromEntries(new URLSearchParams(location.search).entries())
    const oldParams = fromPairs([
      ...new URLSearchParams(location.search).entries()
    ]);
    replaceQueryString({ ...oldParams, ...params });
  };

  const getSearchParam = key =>
    unmarshallValue(new URLSearchParams(location.search.replace('?', '')).get(key));

  const getSearchParams = keys => {
    const searchParams = new URLSearchParams(location.search.replace('?', ''));
    return keys
      ? fromPairs(keys.map(k => [k, unmarshallValue(searchParams.get(k))]))
      : fromSearchParams(searchParams);
  };

  const getSearchParamsClosestToString = keys => {
    const searchParams = new URLSearchParams(location.search);
    return keys
      ? fromPairs(keys.map(k => [k, unmarshallValueClosestToString(searchParams.get(k))]))
      : fromSearchParamsToClosestString(searchParams);
  };

  return {
    updateQueryString,
    replaceQueryString,
    getSearchParam,
    getSearchParams,
    getSearchParamsClosestToString
  };
}
