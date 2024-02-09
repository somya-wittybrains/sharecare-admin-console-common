import React from 'react';
import { Popup, Table } from 'semantic-ui-react';

const TableCellWithPopup = function ({
  popupContent,
  popupOn = 'hover',
  tableContent,
  showPopup = true,
  ...tableProps
}) {
  return showPopup ? (
    <Popup
      inverted
      content={popupContent}
      on={popupOn}
      position='top center'
      trigger={<Table.Cell {...tableProps}>{tableContent}</Table.Cell>}
    />
  ) : (
    <Table.Cell {...tableProps}>{tableContent}</Table.Cell>
  );
};
export default TableCellWithPopup;
