import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { t } from 'translate';
import Box from 'layouts/Box';
import { Button, Loader, Icon, Message, Popup } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';
import { modelStoreSingleton } from 'model';
import { getErrorMessage } from 'utils';
const { restStore } = modelStoreSingleton;

const PopupWithButtonAndAction = observer(
  ({
    requestUrl,
    requestOptions,
    requestErrorMessage,
    buttonText,
    popUpTrigger,
    onClose = () => {},
    onButtonClick = () => {},
    requestSuccessMessage = t('Request Successful'),
    uniqueStateKey = Math.random().toString()
  }) => {
    const [loading, setLoading] = useState({ [uniqueStateKey]: false });
    const [error, setError] = useState({ [uniqueStateKey]: false });
    const [complete, setComplete] = useState({ [uniqueStateKey]: false });
    const [openAssignmentPopup, setOpenAssignmentPopup] = useState({ [uniqueStateKey]: false });
    const actionCall = async () => {
      setComplete({ [uniqueStateKey]: false })
      setLoading({ [uniqueStateKey]: true });
      try {
        const requestResponse = await restStore.fetch(requestUrl, requestOptions);
        if (requestResponse?.error)
          setError({ [uniqueStateKey]: getErrorMessage(requestResponse.error) });
      } catch (e) {
        setError({ [uniqueStateKey]: getErrorMessage(e) });
      }
      setLoading({ [uniqueStateKey]: false });
      setComplete({ [uniqueStateKey]: true })
    };
    return (
      <Popup
        position='top left'
        basic
        size='large'
        style={{ padding: 0 }}
        open={openAssignmentPopup[uniqueStateKey]}
        offset={[50, 10]}
        trigger={popUpTrigger(() => setOpenAssignmentPopup({ [uniqueStateKey]: true }))}
      >
        <Box style={{ height: '6.5em', width: '19em' }}>
          <Box style={{ textAlign: 'right' }}>
            <Icon
              inverted
              color='action-button-popup-close-icon'
              name='window close'
              size='large'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                onClose();
                setOpenAssignmentPopup({ [uniqueStateKey]: false });
              }}
            />
          </Box>
          <Box style={{ paddingTop: '1em', textAlign: 'center' }}>
            {!loading[uniqueStateKey] ? (
              complete[uniqueStateKey] ? (
                <Box
                  textAlign={'center'}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', height: '2.75em' }}
                >
                  <Message
                    size='mini'
                    positive={!error[uniqueStateKey]}
                    negative={!!error[uniqueStateKey]}
                    content={error[uniqueStateKey]
                      ? requestErrorMessage || error[uniqueStateKey]
                      : requestSuccessMessage
                    }
                    style={{
                      flexGrow: '0.9',
                      display: 'flex',
                      height: '2.5em',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                </Box>
              ) : (
                <Button
                  type='button'
                  color='teal'
                  style={{ marginRight: 0 }}
                  onClick={() => {
                    actionCall();
                    onButtonClick();
                  } }
                >
                  {buttonText}
                </Button>
              )
            ) : (
              <Loader size='medium' style={{ display: 'inline' }} />
            )}
          </Box>
        </Box>
      </Popup>
    );
  }
);

PopupWithButtonAndAction.propTypes = {
  requestUrl: PropTypes.string.isRequired,
  requestOptions: PropTypes.object.isRequired,
  requestErrorMessage: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  popUpTrigger: PropTypes.any.isRequired,
  onClose: PropTypes.func,
  onButtonClick: PropTypes.func,
  requestSuccessMessage: PropTypes.string,
  uniqueStateKey: PropTypes.string
}

export default PopupWithButtonAndAction;
