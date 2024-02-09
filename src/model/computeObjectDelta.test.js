const computeObjectDelta = require('./computeObjectDelta').default;

describe('computeObjectDelta', () => {
  test('Remembers the keepers', () => {
    expect(computeObjectDelta({ id: 13 }, {}, ['id'])).toStrictEqual({
      id: 13
    });
  });

  test('Remembers the keepers even if undefined', () => {
    expect(computeObjectDelta({}, {}, ['id', 'anotherId'])).toStrictEqual({
      id: undefined,
      anotherId: undefined
    });
  });

  test('Ignores untouched data', () => {
    expect(computeObjectDelta({ attr1: 'oui' }, { attr1: 'oui' })).toEqual({});
  });

  test('Retains modified data', () => {
    expect(
      computeObjectDelta({ attr1: 'oui' }, { attr1: 'oui', attr2: 'non' })
    ).toEqual({ attr2: 'non' });
  });

  test('Does not assume new data from old data', () => {
    expect(
      computeObjectDelta({ attr1: 'oui', attr2: 'non' }, { attr1: 'oui' })
    ).toEqual({});
  });

  test('Casts new empty strings to nulls', () => {
    expect(
      computeObjectDelta(
        { attr1: 'oui', attr2: 'non' },
        { attr1: '', attr3: '' }
      )
    ).toEqual({ attr1: null, attr3: null });
  });
});
