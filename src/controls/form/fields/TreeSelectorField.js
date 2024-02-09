import React from 'react';
import PropTypes from 'prop-types';
import { Form, Table } from 'semantic-ui-react';
import FormField from 'controls/form/fields';
import { Branch } from 'model/Tree';
import './TreeSelectorField.css';

const debug = require('debug')('controls.form.fields.TreeSelectorField');

const buildTree = (
  disabled,
  currentValues,
  onChange,
  branch,
  hierarchy = [],
  showItemCallback = null
) => {
  const leaves = (branch.leaves || []).filter(leaf => (!showItemCallback || showItemCallback(leaf, currentValues)));
  const leafValues = leaves.map(({ value }) => value);
  const currentValue = leafValues.filter(value =>
    currentValues.includes(value)
  )[0];

  const branches = branch.branches.filter(branch => (!showItemCallback || showItemCallback(branch, currentValues)));

  const active = !!branch.values.filter(
    value => !!currentValues.includes(value)
  ).length;

  const contents = [
    <Table.Row key={`tree-selector-row-${branch.id}`}>
      <Table.Cell>
        <FormField.Boolean
          id={`${branch.id}-toggle`}
          label={branch.name}
          value={active}
          style={{ paddingLeft: `${hierarchy.length * 30}px` }}
          className='tree-branch-toggle'
          disabled={disabled}
          onChange={isSelected => {
            if (isSelected) {
              debug(
                'updating values to %o',
                currentValues.concat(currentValue || leafValues[0])
              );
              onChange(currentValues.concat(currentValue || leafValues[0]));
            } else {
              const branchValues = branch.values;
              debug(
                'updating values to %o',
                currentValues.filter(value => !branchValues.includes(value))
              );
              onChange(
                currentValues.filter(value => !branchValues.includes(value))
              );
            }
          }}
        />
      </Table.Cell>
      {leaves.length > 1 ? (
        <Table.Cell>
          <FormField.Enum
            id={`${branch.id}-enum`}
            disabled={!active || disabled}
            options={leaves.map(({ id, name, value }) => ({
              key: id,
              text: name,
              value
            }))}
            value={currentValue || leafValues[0]}
            onChange={newValue => {
              debug(
                'updating values to %o',
                currentValues.reduce(
                  (newValues, value) =>
                    currentValue === value
                      ? newValues
                      : newValues.concat(value),
                  [newValue]
                )
              );
              onChange(
                currentValues.reduce(
                  (newValues, value) =>
                    currentValue === value
                      ? newValues
                      : newValues.concat(value),
                  [newValue]
                )
              );
            }}
          />
        </Table.Cell>
      ) : (
        <Table.Cell />
      )}
    </Table.Row>
  ];

  if (active && branches.length) {
    return contents.concat(
      branches.map(branch =>
        buildTree(
          disabled,
          currentValues,
          onChange,
          branch,
          hierarchy.concat(branch.id),
          showItemCallback
        )
      )
    );
  } else {
    return contents;
  }
};

const TreeSelectorField = ({
  id = 'tree-selector-id',
  label = '',
  options = [],
  value = [],
  disabled = false,
  onChange = () => {},
  showItemCallback,
  ...props
}) => {
  debug('render(%o)', value);

  return (
    <Form.Field className='tree-selector' {...props}>
      {label && <label htmlFor={id}>{label}</label>}
      <Table compact basic='very'>
        <Table.Body>
          {options.filter(item=>(!showItemCallback || showItemCallback(item, value))).map(branch => buildTree(disabled, value, onChange, branch, [], showItemCallback))}
        </Table.Body>
      </Table>
    </Form.Field>
  );
};

TreeSelectorField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.instanceOf(Branch)),
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func
};

export default TreeSelectorField;
