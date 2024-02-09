import { useState } from 'react';

const reverseSort = sort => {
  return sort[0] === '-' ? sort.slice(1) : `-${sort}`;
};

export default function useRestSort (field) {
  const [sort, setSort] = useState(field);

  const sortBy = field => {
    setSort(sort => (sort.includes(field) ? reverseSort(sort) : field));
  };

  const sorted = field =>
    sort === field
      ? 'ascending'
      : sort.includes(field)
      ? 'descending'
      : undefined;

  return {
    getSortProps (field) {
      return {
        sorted: sorted(field),
        onClick: () => sortBy(field)
      };
    },
    sort
  };
}
