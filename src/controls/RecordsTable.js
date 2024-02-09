import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Table } from 'semantic-ui-react';

// eslint-disable-next-line react/display-name
export const makeDefaultRenderRow = (headers, props, renderDetailsRow) => (
  record,
  i
) => (
  <React.Fragment>
    <Table.Row key={i}>
      {headers.map(
        (
          { key, format = String, placeholder = '', component: Component, cellProps={} },
          index
        ) => {
          const value = get(record, key, placeholder);
          const label = format(value, record);
          return (
            <Table.Cell style={{ ...props }} key={`${key}-${index}`} {...cellProps}>
              {Component ? (
                <Component value={value} label={label} record={record} />
              ) : (
                label || value
              )}
            </Table.Cell>
          );
        }
      )}
    </Table.Row>
    {renderDetailsRow && renderDetailsRow({ record, colCount: headers.length })}
  </React.Fragment>
);

export default function RecordsTable ({
  records,
  headers,
  renderBodyRow,
  renderDetailsRow,
  emptyFooter,
  getSortProps,
  className = '',
  ...props
}) {
  return (
    <Table
      striped
      compact
      sortable={Boolean(getSortProps)}
      tableData={records}
      className={className}
      headerRow={
        <Table.Row>
          {headers.map(({ key, label, sortable, cellProps = {style: {}} }) => (
            <Table.HeaderCell
              key={key}
              {...(sortable && getSortProps ? getSortProps(key) : null)}
              style={{cursor: sortable && getSortProps && getSortProps(key) ? 'pointer' : 'auto', ...cellProps.style}}
            >
              {label}
            </Table.HeaderCell>
          ))}
        </Table.Row>
      }
      renderBodyRow={
        renderBodyRow || makeDefaultRenderRow(headers, props, renderDetailsRow)
      }
      footerRow={
        records.length > 0 ? null : (
          <Table.Row>
            <Table.HeaderCell colSpan={headers.length}>
              {emptyFooter}
            </Table.HeaderCell>
          </Table.Row>
        )
      }
    />
  );
}
RecordsTable.propTypes = {
  records: PropTypes.arrayOf(PropTypes.object).isRequired,
  headers: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderBodyRow: PropTypes.func,
  emptyFooter: PropTypes.element,
  getSortProps: PropTypes.func
};
