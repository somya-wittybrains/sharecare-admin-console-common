import { useState } from 'react';

// Streamlines working with flagged entities, such as:
// - Mark this record for deletion
// - Flag this one for cloning
// - ...
// It's really just a `useState` that receives a list of operators
// and provides convenience functions.
export default function useEntityOperatorState (ops, initialEntity = null) {
  const [{ op, entity }, flagEntity] = useState({
    op: null,
    entity: initialEntity
  });
  const resetFlaggedEntity = () => flagEntity({ op: null, entity: null });

  const is = operator => op === operator;
  const confirm = op => entity => flagEntity({ op, entity });
  return { is, entity, reset: resetFlaggedEntity, confirm };
}
