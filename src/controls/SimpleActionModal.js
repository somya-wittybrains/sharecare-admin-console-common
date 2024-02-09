import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Header, Icon, Message } from 'semantic-ui-react';
import { t } from '../translate';

const defaultCancelLabel = t('Cancel');
const defaultConfirmLabel = t('Confirm');

export default function SimpleActionModal ({
  open,
  onClose,
  onConfirm,
  busy,
  header,
  description,
  showCancel = true,
  cancelLabel = defaultCancelLabel,
  confirmLabel = defaultConfirmLabel,
  confirmIcon,
  negative = false,
  primary = true,
  secondary = false,
  closeOnEscape = false,
  closeOnDimmerClick = false,
  disableConfirm = false,
  size = 'tiny',
  error,
  clearError,
  ...props
}) {
  return (
    <Modal
      {...props}
      size={size}
      dimmer='blurring'
      open={open}
      onClose={onClose}
      closeOnEscape={closeOnEscape}
      closeOnDimmerClick={closeOnDimmerClick}
    >
      <Modal.Content>
        <Header as='h2'>{header}</Header>
        <Modal.Description>
        {error && (
              <Message
                negative
                content={error}
                onDismiss={() => clearError ? clearError() : null}
              />
           )}
          {description}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        {showCancel && (
          <Button
            type='button'
            onClick={onClose}
            size='large'disabled={busy}
          >
          {cancelLabel}
        </Button>)}

        {confirmLabel && (
          <Button
            type='button'
            onClick={() => onConfirm()}
            size='large'
            disabled={disableConfirm || busy}
            loading={busy}
            primary={primary}
            secondary={secondary}
            negative={negative}
          >
            {confirmIcon && <Icon name={confirmIcon} />}
            {confirmIcon && ' '}
            {confirmLabel}
          </Button>
        )}
      </Modal.Actions>
    </Modal>
  );
}
SimpleActionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  header: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
  cancelLabel: PropTypes.string,
  confirmLabel: PropTypes.string,
  confirmIcon: PropTypes.string,
  negative: PropTypes.bool,
  busy: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  closeOnDimmerClick: PropTypes.bool
};
