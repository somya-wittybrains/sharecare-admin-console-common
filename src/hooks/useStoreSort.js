const reverseSort = direction =>
  direction === 'ascending' ? 'descending' : 'ascending';

export default function useStoreSort (
  store,
  { onSort, disabled = false } = {}
) {
  return {
    getSortProps (fieldName) {
      return {
        sorted: store.sortField === fieldName ? store.sortDirection : undefined,
        onClick: () => {
          if (disabled) return;
          const direction = reverseSort(
            store.sortField === fieldName ? store.sortDirection : undefined
          );
          store.sortBy(fieldName, direction);
          if (onSort) onSort(fieldName, direction);
        }
      };
    }
  };
}
