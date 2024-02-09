import React, { useState } from 'react';
import {
  Form,
  Grid,
  Label,
  Icon,
  Table,
  Segment,
  Item
} from 'semantic-ui-react';
import StringField from './StringField';
import './DynamicListSelectorField.css';
import EnumField from 'controls/form/fields/EnumField';

const debug = require('debug')('controls.form.fields.DynamicListSelectorField');

const DynamicListSelectorField = ({
  id = 'dynamic-list-selector-id',
  label = '',
  options = [],
  value: selectedValues = [],
  required = false,
  onChange = () => {},
  noSelectionDisplay,
  selectedItemsPadding,
  selectedLabel,
  selectedActionLabel = null,
  readOnly,
  showFilters = false,
  firstFilterOptions = [],
  firstFilterLabel = '',
  secondFilterOptions = [],
  secondFilterLabel = '',
  showSort = false,
  sortLabel = '',
  error,
  onRemoveItem,
}) => {
  debug('render(%o)', selectedValues);

  const [filter, setFilter] = useState('');
  const [firstFilter, setFirstFilter] = useState('All');
  const [secondFilter, setSecondFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc');

  const flexColumn = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0
  };

  const addToSelectedValues = value => {
    if (selectedValues.indexOf(value) < 0) {
      onChange(selectedValues.concat(value));
    }
  };

  return (
    <Form
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}
    >
      <Form.Field
        className='dynamic-list-selector'
        required={required}
        style={flexColumn}
        error={Boolean(error)}
      >
        {showFilters && (
          <Item as='div' style={{ display: 'flex' }}>
            <EnumField
              id='firstFilter'
              width={7}
              compact
              label={firstFilterLabel}
              options={firstFilterOptions}
              value={firstFilter}
              onChange={filter => setFirstFilter(filter)}
              fluid
            />
            <Item as='div' style={{ width: '100%', marginLeft: '2em' }}>
              <EnumField
                id='secondFilter'
                width={7}
                compact
                label={secondFilterLabel}
                options={secondFilterOptions}
                value={secondFilter}
                onChange={filter => setSecondFilter(filter)}
                fluid
              />
            </Item>
          </Item>
        )}
        {label && <label htmlFor={id}>{label}</label>}
        <Grid
          celled
          columns='equal'
          padded={false}
          style={{ ...flexColumn, position: 'relative' }}
        >
          {readOnly && (
            <div
              style={{
                position: 'absolute',
                top: '0px',
                left: '0px',
                background: '#cacaca',
                opacity: 0.1,
                width: '100%',
                height: '100%'
              }}
            >
              &nbsp;
            </div>
          )}
          <Grid.Row columns='equal' style={{ flex: 1, minHeight: 0 }}>
            <Grid.Column style={{ ...flexColumn, height: '100%' }}>
              <Segment secondary basic>
                <Item
                  as='div'
                  style={{
                    display: showSort ? 'flex' : 'inline',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <StringField
                    style={{ width: showSort ? '16rem' : '100%' }}
                    id={`${id}-search`}
                    disabled={readOnly}
                    fluid
                    clearable
                    value={filter || ''}
                    onChange={setFilter}
                  />
                  {showSort && (
                    <label
                      style={{
                        paddingBottom: '1rem',
                        fontWeight: 'bold',
                        color: '#7f8fa4'
                      }}
                      onClick={() =>
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                    >
                      {sortLabel}
                      <Icon
                        name={sortOrder === 'asc' ? 'angle up' : 'angle down'}
                      />
                    </label>
                  )}
                </Item>
              </Segment>
              <Segment basic style={{ flex: 1, overflow: 'auto' }}>
                <Table striped selectable basic='very'>
                  <Table.Body>
                    {options
                      .filter(
                        ({ title }) =>
                          !filter ||
                          title.toLowerCase().indexOf(filter.toLowerCase()) !==
                            -1
                      )
                      .filter(
                        ({ firstFilterValue }) =>
                          firstFilter === 'All' ||
                          firstFilterValue === firstFilter
                      )
                      .filter(
                        ({ secondFilterValue }) =>
                          secondFilter === 'All' ||
                          secondFilterValue.includes(secondFilter)
                      )
                      .sort(({ title: t1 = '' }, { title: t2 = '' }) =>
                        sortOrder === 'asc'
                          ? t1.localeCompare(t2)
                          : t2.localeCompare(t1)
                      )
                      .map(({ title, value, content }, i) => (
                        <Table.Row
                          key={`${id}-opt-${i}`}
                          onClick={() => {
                            if (!readOnly) {
                              addToSelectedValues(value);
                            }
                          }}
                        >
                          <Table.Cell
                            style={{
                              wordBreak: 'break-all',
                              color: selectedValues.includes(value)
                                ? '#2185D0'
                                : 'inherit'
                            }}
                          >
                            {content || title}
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
            <Grid.Column style={{ ...flexColumn, height: '100%' }}>
              <div style={{ flex: 1, paddingRight: '5px', overflow: 'auto' }}>
                <Table basic='very'>
                  {selectedLabel && (
                    <Table.Header>
                      <Table.Row
                        style={{
                          color: '#7f8fa4',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          paddingTop: '5px',
                          marginBottom: '5px'
                        }}
                      >
                        <Table.Cell
                          style={{
                            borderBottom: '1px solid #d4d4d5',
                            paddingBottom: '5px'
                          }}
                        >
                          {`${selectedLabel} (${selectedValues.length})`}
                        </Table.Cell>
                        {selectedActionLabel && (
                          <Table.Cell
                            textAlign='center'
                            style={{
                              borderBottom: '1px solid #d4d4d5',
                              paddingBottom: '5px',
                              paddingLeft: 0,
                              width: '20%'
                            }}
                          >
                            {selectedActionLabel}
                          </Table.Cell>
                        )}
                      </Table.Row>
                      <Table.Row style={{ lineHeight: '5px' }}>
                        <Table.Cell>
                          &nbsp;
                        </Table.Cell>
                      </Table.Row>
                    </Table.Header>
                  )}
                  <Table.Body>
                    {options
                      .filter(({ value }) => selectedValues.includes(value))
                      .sort(({ title: t1 }, { title: t2 }) =>
                        t1.localeCompare(t2)
                      )
                      .map(
                        (
                          {
                            title,
                            value,
                            selectedContent,
                            selectedContentIcon,
                            selectedContentAction = null
                          },
                          i
                        ) => (
                          <Table.Row key={`${id}-selection-${i}`}>
                            <Table.Cell
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: selectedItemsPadding
                                  ? selectedItemsPadding
                                  : '2px 0px'
                              }}
                            >
                              {selectedContentIcon && selectedContentIcon}
                              <Label
                                color='blue'
                                size='large'
                                className='fluid'
                                style={{ display: 'flex' }}
                              >
                                <div style={{ flex: 1 }}>
                                  {selectedContent || title}
                                </div>
                                <Icon
                                  name='delete'
                                  onClick={() => {
                                    if (!readOnly) {
                                      debug(
                                        'setting values to %o',
                                        selectedValues.filter(
                                          val => val !== value
                                        )
                                      );
                                      onRemoveItem ? onRemoveItem(value) :
                                      onChange(
                                        selectedValues.filter(
                                          val => val !== value
                                        )
                                      );
                                    }
                                  }}
                                />
                              </Label>
                            </Table.Cell>
                            {selectedContentAction && (
                              <Table.Cell
                                style={{
                                  textAlign: 'center',
                                  paddingLeft: 0
                                }}
                              >
                                {selectedContentAction}
                              </Table.Cell>
                            )}
                          </Table.Row>
                        )
                      )}
                  </Table.Body>
                </Table>
                {noSelectionDisplay &&
                      selectedValues.length === 0 &&
                      noSelectionDisplay}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        {error && (
          <Label basic color='red' pointing>
            {error}
          </Label>
        )}
      </Form.Field>
    </Form>
  );
};
export default DynamicListSelectorField;