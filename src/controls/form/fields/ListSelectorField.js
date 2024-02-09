import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Grid, Label, Icon, Table, Segment } from 'semantic-ui-react';
import StringField from './StringField';
import './ListSelectorField.css';

const debug = require('debug')('controls.form.fields.ListSelectorField');

const ListSelectorField = ({
  id = 'list-selector-id',
  label = '',
  options = [],
  value: selectedValues = [],
  rows = 5,
  required = false,
  onChange = () => {},
  disabled = false,
  noSelectionDisplay
}) => {
  debug('render(%o)', selectedValues);

  const [filter, setFilter] = useState('');
  const tableHeight = rows * 40;
  const columnHeight = tableHeight + 48;

  return (
    <Form.Field className='list-selector' required={required}>
      {label && <label htmlFor={id}>{label}</label>}
      <Grid celled columns='equal' padded={false}>
        <Grid.Row columns='equal'>
          <Grid.Column style={{ height: `${columnHeight}px` }}>
            <Segment secondary basic>
              <StringField
                disabled={disabled}
                id={`${id}-search`}
                fluid
                clearable
                value={filter || ''}
                onChange={setFilter}
              />
            </Segment>
            <Segment
              basic
              style={{ height: `${tableHeight}px`, overflow: 'auto' }}
            >
              <Table striped selectable basic='very'>
                <Table.Body>
                  {options
                    .filter(
                      ({ title }) =>
                        !filter ||
                        title.toLowerCase().indexOf(filter.toLowerCase()) !== -1
                    )
                    .sort(({ title: t1 = '' }, { title: t2 = '' }) =>
                      t1.localeCompare(t2)
                    )
                    .map(({ title, value, icon = null }, i) => (
                      <Table.Row
                        key={`${id}-opt-${i}`}
                        onClick={
                          disabled
                            ? () => {}
                            : () => {
                                debug(
                                  'setting values to %o',
                                  selectedValues.concat(value)
                                );
                                onChange(selectedValues.concat(value));
                              }
                        }
                      >
                        <Table.Cell>
                          {icon}
                          {title}
                        </Table.Cell>
                        <Table.Cell>
                          {selectedValues.includes(value) && (
                            <Icon name='check' color='blue' />
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                </Table.Body>
              </Table>
            </Segment>
          </Grid.Column>
          <Grid.Column
            style={{ height: `${columnHeight}px`, overflow: 'auto' }}
          >
            <Table basic='very'>
              <Table.Body>
                {options
                  .filter(({ value }) => selectedValues.includes(value))
                  .sort(({ title: t1 }, { title: t2 }) => t1.localeCompare(t2))
                  .map(({ title, value, icon = null, rightIcon = null }, i) => (
                    <Table.Row key={`${id}-selection-${i}`}>
                      <Table.Cell>
                        <Label color='blue' size='large' className='fluid'>
                          {rightIcon ? rightIcon : icon}
                          {title}
                          <Icon
                            name='delete'
                            onClick={
                              disabled
                                ? () => {}
                                : () => {
                                    debug(
                                      'setting values to %o',
                                      selectedValues.filter(
                                        val => val !== value
                                      )
                                    );
                                    onChange(
                                      selectedValues.filter(
                                        val => val !== value
                                      )
                                    );
                                  }
                            }
                          />
                        </Label>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                {noSelectionDisplay &&
                  selectedValues.length === 0 &&
                  noSelectionDisplay}
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form.Field>
  );
};

ListSelectorField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.required,
      value: PropTypes.string.required
    })
  ),
  value: PropTypes.arrayOf(PropTypes.string),
  rows: PropTypes.number,
  required: PropTypes.bool,
  onChange: PropTypes.func
};

export default ListSelectorField;
