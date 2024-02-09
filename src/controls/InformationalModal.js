import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Header, Icon } from 'semantic-ui-react';
// Deprecated.
// Couples promise state + UI.
// Prefer using hooks + SimpleActionModal
export default function InformationalModal ({
  open,
  onClose,
  onConfirm,
  header,
  description,
  cancelLabel = 'Cancel',
  confirmLabel = 'Delete',
  closeOnEscape = false,
  closeOnDimmerClick = false,
  confirmIcon,
  showWarning = false,
  negative,
  ...props
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const handleConfirm = () => {
    setIsConfirming(true);
    Promise.resolve(onConfirm()).then(
      result => {
        setIsConfirming(false);
        onClose();
        return result;
      },
      error => {
        setIsConfirming(false);
        throw error;
      }
    );
  };
  return (
    <Modal
      {...props}
      size='large'
      dimmer='blurring'
      open={open}
      onClose={onClose}
    >
      <Modal.Content>
        <Header as='h2'>
          {showWarning && (
            <Icon
              name={'exclamation triangle'}
              style={{
                color: '#f5a623',
                fontSize: '0.9em',
                margin: ' -11px 0 0 0'
              }}
            />
          )}{' '}
          {header}
        </Header>

        <Modal.Description>{description}</Modal.Description>
      </Modal.Content>

      <Modal.Actions>
        {cancelLabel && (
          <Button onClick={onClose} size='large' disabled={isConfirming}>
            {cancelLabel}
          </Button>
        )}
        <Button
          onClick={() => handleConfirm()}
          size='large'
          disabled={isConfirming}
          loading={isConfirming}
          secondary
          negative={negative ? true : false}
        >
          {confirmIcon && <Icon name={confirmIcon} />}
          {confirmIcon && ' '}
          {confirmLabel}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
InformationalModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  header: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
  cancelLabel: PropTypes.string,
  confirmLabel: PropTypes.string,
  confirmIcon: PropTypes.string
};
