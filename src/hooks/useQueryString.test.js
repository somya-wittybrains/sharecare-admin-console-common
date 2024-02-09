import useQueryString from './useQueryString';

describe('useQueryString hook', () => {
  test('exposes 4 helpers', () => {
    const useQS = useQueryString({
      history: {},
      match: { url: '' },
      location: { search: '' }
    });

    expect(useQS).toMatchObject({
      updateQueryString: expect.any(Function),
      replaceQueryString: expect.any(Function),
      getSearchParam: expect.any(Function),
      getSearchParams: expect.any(Function)
    });
  });

  test('getSearchParam gets a single param', () => {
    const { getSearchParam } = useQueryString({
      history: {},
      match: { url: '' },
      location: { search: 'p1=coucou' }
    });

    expect(getSearchParam('p1')).toEqual('coucou');
  });

  test('getSearchParams gets multiple params', () => {
    const { getSearchParams } = useQueryString({
      history: {},
      match: { url: '' },
      location: { search: 'p1=coucou&p2=hello' }
    });

    expect(getSearchParams(['p1', 'p2'])).toEqual({
      p1: 'coucou',
      p2: 'hello'
    });
  });

  test('replaceQueryString replaces history location', () => {
    const replaceSpy = jest.fn();
    const { replaceQueryString } = useQueryString({
      history: { replace: replaceSpy },
      match: { url: '/url' },
      location: { search: '?p1=coucou&p2=hello' }
    });

    replaceQueryString({ p2: 'hi' });
    expect(replaceSpy).toHaveBeenCalledWith({
      path: '/url',
      search: 'p2=hi'
    });
  });

  test('replaceQueryString handles object', () => {
    const replaceSpy = jest.fn();
    const { replaceQueryString } = useQueryString({
      history: { replace: replaceSpy },
      match: { url: '/url' },
      location: { search: '' }
    });

    replaceQueryString({ o: { a1: 'hi', a2: '2', a3: true } });
    expect(replaceSpy).toHaveBeenCalledWith({
      path: '/url',
      search:
        'o=%7B%22a1%22%3A%22hi%22%2C%22a2%22%3A%222%22%2C%22a3%22%3Atrue%7D'
    });
  });

  test('updateQueryString updates history location', () => {
    const replaceSpy = jest.fn();
    const { updateQueryString } = useQueryString({
      history: { replace: replaceSpy },
      match: { url: '/url' },
      location: { search: '?p1=coucou&p2=hello' }
    });

    updateQueryString({ p2: 'hi' });
    expect(replaceSpy).toHaveBeenCalledWith({
      path: '/url',
      search: 'p1=coucou&p2=hi'
    });
  });
});
