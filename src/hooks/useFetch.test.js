import { applyReplace, applyUpdate, evolve } from './useFetch';

describe('applyReplace', () => {
  test('returns a function', () => {
    const result = applyReplace();

    expect(result).toEqual(expect.any(Function));
  });

  test("runner returns the update if it's not a function", () => {
    expect(applyReplace('update')('initial')).toEqual('update');
    expect(applyReplace()('initial')).toBe(undefined);
  });

  test("runner executes the update if it's a function", () => {
    expect(applyReplace(str => str + '!')('initial')).toEqual('initial!');
    expect(applyReplace(() => {})('initial')).toBe(undefined);
  });
});

describe('applyUpdate', () => {
  test('returns a function', () => {
    const result = applyUpdate();

    expect(result).toEqual(expect.any(Function));
  });

  test('runner clones initial if no update is provided', () => {
    const obj = { key: 'val' };
    const updatedObj = applyUpdate()(obj);

    expect(updatedObj).toMatchObject(obj);
    expect(updatedObj).not.toBe(obj);
  });

  test('runner makes no assumption when update is a function', () => {
    expect(applyUpdate(() => {})({ key: 'val' })).toBe(undefined);
  });
});

describe('evolve', () => {
  /*   test('does nothing if no input', () => {
    expect(evolve()).toEqual({});
  }); */
  test('clones its input', () => {
    const obj = { key: 'val' };
    expect(evolve(obj)).toMatchObject(obj);
    //expect(evolve(obj)).not.toBe(obj);
  });

  test('applies transformations by key', () => {
    const obj = { key: 'val' };
    const transforms = {
      key: str => str + '!',
      newKey: () => 'some'
    };

    expect(evolve(obj, transforms)).toMatchObject({
      key: 'val!',
      newKey: 'some'
    });
  });
});
