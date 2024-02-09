import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { observable } from 'mobx';
import { uniqBy, sortBy } from 'lodash';
import { useObserver, useLocalStore } from 'mobx-react-lite';

export default function DynamicEnumLoader ({
  as: Component,
  searchKey,
  renderContent,
  numberOfCharsForSearchToTrigger = 1,
  value,
  onSearchChange,
  renderLabel,
  popUpText,
  store,
  additionalFilterProps,
  onChange,
  readOnly,
  clearable,
  onKeyPress,
  search,
  ...props
}) {
  const suggestStore = useLocalStore(() => ({
    get loading () {
      return store.loading;
    },
    suggestions: observable.array([]),
    addSuggestions: more => {
      suggestStore.suggestions = sortBy(
        uniqBy((more || []).concat(suggestStore.suggestions), 'value'),
        'text'
      );
    }
  }));
  const handleSearchChange = search => {
    if (search.length >= numberOfCharsForSearchToTrigger) {
      return onSearchChange(search).then(list =>
        suggestStore.addSuggestions(list)
      );
    }
  };

  useEffect(() => {
    store
      .suggest({ ...additionalFilterProps, [searchKey]: value })
      .then(list => {
        suggestStore.addSuggestions(list);
      });
    // This is an exception to not block CRA update (CN-577). Do not duplicate. Properly fix this instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useObserver(() => (
    <Component
      clearable={readOnly ? false : clearable}
      onSearchChange={readOnly ? ()=>{}: handleSearchChange}
      onChange={readOnly ? ()=>{}: onChange}
      onKeyPress={readOnly ? ()=>{} : onKeyPress}
      search={readOnly ? false : search}
      renderLabel={renderLabel}
      loading={suggestStore.loading}
      options={suggestStore.suggestions.map(({ value, text }) => ({
        key: text,
        value,
        content: renderContent ? renderContent(value) : undefined,
        text: popUpText ? popUpText({ value, text }) : text
      }))}
      value={value}
      {...props}
    />
  ));
}

DynamicEnumLoader.propTypes = {
  as: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  value: PropTypes.any,
  onSearchChange: PropTypes.func.isRequired,
  store: PropTypes.object.isRequired
};
