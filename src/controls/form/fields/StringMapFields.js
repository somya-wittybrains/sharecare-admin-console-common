import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Icon } from 'semantic-ui-react';
import FormField from 'controls/form/fields';
import ActionIcon from 'controls/ActionIcon';
import { t } from 'translate';
import './StringMapFields.css';

export default function StringMapFields ({
  onChange,
  deletable,
  value = {},
  deletePopupContent,
  addButtonLabel,
  checkFieldError,
  deleteConfirmProps = {}
}) {
  const valueMap = value;
  const [deleteConfirm, setDeleteConfirm] = useState({});
  const handleAddItem = () => {
    onChange([...valueMap, { key: '', value: '' }]);
  };
  const onKeyChange = (value, index) => {
    if (index !== -1) {
      onChange([
        ...valueMap.slice(0, index),
        { value: valueMap[+index].value, key: value },
        ...valueMap.slice(index + 1)
      ]);
    }
  };
  const onDeleteConfirm = (index) =>{
    handleDeleteItem(index);
    setDeleteConfirm({});    
  }
  const onDeleteCancel = (index) =>{
      setDeleteConfirm({}); 
  } 
  const handleDeleteItem = index =>{
     onChange([
        ...valueMap.slice(0, index),
        ...valueMap.slice(index + 1)
      ]); 
  }
  const onValueChange = (value, index) => {
    if (index !== -1) {
      onChange([
        ...valueMap.slice(0, index),
        { key: valueMap[+index].key, value },
        ...valueMap.slice(index + 1)
      ]);
    }
  };

  const {as, description, ...deleteProps } = deleteConfirmProps;
  const Component = as;  
  const overAllDeleteProps = {
    ...deleteProps, 
    open: true, 
    onConfirm: ()=>onDeleteConfirm(deleteConfirm.deleteIndex),
    onClose: onDeleteCancel,
    description: <React.Fragment><p>{t(description ? description : '', {key:Object.keys(deleteConfirm).length !== 0 ? valueMap[deleteConfirm.deleteIndex].key: ''})}</p></React.Fragment>
  }
  return (
    <React.Fragment>
      {valueMap.map((metaKey, index) => (
        <React.Fragment>
          <Form.Group className='stringMap'>
            <FormField.String
              error={checkFieldError(index, 'key')}
              name={`key_${index}`}
              value={metaKey.key}
              onChange={value => onKeyChange(value, index)}
              placeholder={metaKey.keyPlaceholder}
            />
            <FormField.String
              error={checkFieldError(index, 'value')}
              name={`value_${index}`}
              value={metaKey.value}
              onChange={value => onValueChange(value, index)}
              placeholder={metaKey.valuePlaceholder}
            />
            <ActionIcon
              key={index}
              name='trash alternate outline red'
              content={deletePopupContent}
              onClick={e => {
                e.stopPropagation();
                if (Object.keys(deleteConfirmProps).length === 0)
                    handleDeleteItem(index);
                else
                    setDeleteConfirm({deleteIndex: index})  
              }}
            />
          </Form.Group>
        </React.Fragment>
      ))}
      <Button
        onClick={handleAddItem}
        type='button'
        disabled={!!valueMap.find(v => v.key === '')}
        style={{ marginBottom: 20 }}
      >
        <Icon name='plus' />
        {addButtonLabel}
      </Button>
      {as && deleteConfirm && Object.keys(deleteConfirm).length !== 0 && (<Component {...overAllDeleteProps} />)}
    </React.Fragment>
  );
}

StringMapFields.propTypes = {
  onChange: PropTypes.func.isRequired,
  deletable: PropTypes.bool
};
