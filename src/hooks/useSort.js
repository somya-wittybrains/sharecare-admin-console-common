import { useState } from 'react';
import { sortBy as sortCollection, reverse, identity } from 'lodash';

const reverseSort = sortDirection =>
  sortDirection === 'ascending' ? 'descending' : 'ascending';

export default function useClientSort (field, direction = 'ascending') {
  const [{ sortField, sortDirection }, setSort] = useState({
    sortField: field,
    sortDirection: direction
  });

  const sortBy = field => {
    const direction = reverseSort(
      field === sortField ? sortDirection : undefined
    );
    setSort({ sortField: field, sortDirection: direction });
  };

  const sorted = field => (field === sortField ? sortDirection : undefined);

  const directionFn = sortDirection === 'ascending' ? identity : reverse;

  return {
    getSortProps (field) {
      return {
        sorted: sorted(field),
        onClick: () => sortBy(field)
      };
    },
    sortField,
    sortDirection,
    sort: collection => directionFn(sortCollection(collection, [sortField]))
  };
}
