import React from 'react';
import { Table } from 'semantic-ui-react';

function DraggableRow ({
  isDraggable = true,
  meta,
  onDropHandler,
  component,
  onClick = () => {},
  ...rest
}) {
  let event = null;
  const onDragStart = (ev, meta) => {
    event = ev;
    ev.dataTransfer.setData('meta', JSON.stringify(meta));
  };

  const onDragOver = ev => {
    event = ev;
    ev.preventDefault();
  };

  const onDrop = (ev, a) => {
    event = ev;
    const meta = JSON.parse(ev.dataTransfer.getData('meta'));
    if (onDropHandler) onDropHandler(meta, a, ev);
  };
  const Component = component;
  return (
    <React.Fragment>
      <Table.Row
        draggable={isDraggable}
        className={isDraggable ? 'draggable' : undefined}
        onDragStart={e => onDragStart(e, meta)}
        onDragOver={e => onDragOver(e)}
        onDrop={e => {
          onDrop(e, meta);
        }}
      >
        <Table.Cell>
          <Component onClick={onClick} meta={meta} {...rest} event={event} />
        </Table.Cell>
      </Table.Row>
    </React.Fragment>
  );
}

export default DraggableRow;
