import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Menu,
  Button,
  Segment,
  Form,
  Message,
  Icon
} from 'semantic-ui-react';
import { t } from 'translate';
import Box from 'layouts/Box';
import useSteps from 'hooks/useSteps';

// TODO can that be turned into a generic control?

export default function LanguageConfigurationModal ({
  trigger,
  title,
  steps,
  stepLabels,
  formal,
  onClose,
  open,
  canEdit
}) {
  const { hasNext, handleNext, handleStepClick, currentStep } = useSteps(steps);
  const requestedTranslations =
    formal.isDirty &&
    formal.values.displayLocales &&
    formal.values.displayLocales.length > 0
      ? `( ${formal.values.displayLocales.length} )`
      : '';
  return (
    <Modal
      className='new-group-modal'
      as={Form}
      {...formal.getFormProps()}
      closeOnDimmerClick={false}
      trigger={trigger}
      open={open}
      onClose={onClose}
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content scrolling>
        <Segment basic style={{ height: '450px', padding: '0px' }}>
          {!formal.isValid && (
            <Message
              negative
              content='Form has validation errors'
              onDismiss={() => formal.clearErrors()}
            />
          )}
          <Box mb='big'>
            <Menu pointing secondary>
              {Array.from(Array(steps.length).keys()).map(i => (
                <Menu.Item
                  key={i}
                  name={stepLabels[i]}
                  data-value={i}
                  onClick={handleStepClick}
                  active={currentStep === i}
                >
                  {t(stepLabels[i])}
                </Menu.Item>
              ))}
            </Menu>
          </Box>
          {steps[currentStep]}
        </Segment>
      </Modal.Content>
      <Modal.Actions className='flex-space'>
        <Button
          type='button'
          content={t(formal.isDirty ? 'Cancel' : 'Close')}
          onClick={onClose}
        />
        <Button
          type='button'
          color='green'
          content={t(`Request Translations ${requestedTranslations}`)}
          onClick={() => formal.submit()}
          disabled={!formal.isDirty || !formal.values?.isTranslationEnabled || !canEdit}
        />
        <Button type='button' primary disabled={!hasNext} onClick={handleNext}>
          Next <Icon name='chevron right' />
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

LanguageConfigurationModal.propTypes = {
  trigger: PropTypes.element,
  title: PropTypes.string,
  error: PropTypes.string,
  steps: PropTypes.arrayOf(PropTypes.element).isRequired,
  stepLabels: PropTypes.arrayOf(PropTypes.string),
  formal: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  clearError: PropTypes.func,
  open: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired
};
