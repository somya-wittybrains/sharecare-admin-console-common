import { isEqual } from 'lodash';

export default function computeObjectDelta(
  objectOld,
  objectNew,
  keeperFields = []
) {
  return Object.fromEntries(
    Object.entries(objectNew)
      // only keep the data that changed
      .filter(([key, valueNew]) => !isEqual(valueNew, objectOld[key]))
      // empty string means deletion
      .map(([key, value]) => [key, value === '' ? null : value])
      // keep the keepers
      .concat(keeperFields.map(field => [field, objectOld[field]]))
  );
}
