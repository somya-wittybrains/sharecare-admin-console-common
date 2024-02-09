import React from 'react';
import PropTypes from 'prop-types';

export default function ArrayValue ({ itemAs: Item, value, placeholder }) {
  let processedValue = [];
  if(value){
    if(typeof (value) === 'string'){
      processedValue = value.split(',');
    } else processedValue = value; 
  } 

  return (
    <div
      style={{
        marginBottom: '1em',
        overflowWrap: 'break-word'
      }}
    >
      {processedValue && processedValue.length === 0   
        ? placeholder
        : Item
        ? processedValue.map((v, i) => <Item key={i}>{v}</Item>)
        : processedValue.join(', ')}
    </div>
  );
}

ArrayValue.propTypes = {
  value: PropTypes.arrayOf(PropTypes.any),
  placeholder: PropTypes.any,
  itemAs: PropTypes.elementType
};
