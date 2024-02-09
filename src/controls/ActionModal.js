import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SimpleActionModal from './SimpleActionModal';

// Deprecated.
// Couples promise state + UI.
// Prefer using hooks + SimpleActionModal
export default function ActionModal ({ onClose, onConfirm, clearError, error, ...props }) {
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
        if (!clearError)
          throw error;
      }
    );
  };
  return (
    <SimpleActionModal
      {...props}
      busy={isConfirming}
      onConfirm={handleConfirm}
      onClose={onClose}
      error={error}
      clearError={clearError}
    />
  );
}
ActionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  header: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
  cancelLabel: PropTypes.string,
  confirmLabel: PropTypes.string,
  confirmIcon: PropTypes.string,
  negative: PropTypes.bool
};
