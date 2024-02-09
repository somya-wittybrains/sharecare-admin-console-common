import React from 'react';
import PropTypes from 'prop-types';
import { history as historyPropType } from 'model/router-prop-types';
import { withRouter } from 'react-router-dom';
import { Icon, Popup } from 'semantic-ui-react';
import { t } from 'translate';
import ClickLink from 'controls/ClickLink';

function BackLink ({ popupText = '', label = t('Return'), onClick, history }) {
  const handleClick = onClick ? onClick : () => history.goBack();

  return (
    <Popup
      inverted
      disabled={popupText === ''}
      position='top center'
      content={popupText}
      trigger={
        <div>
          <ClickLink
            onClick={handleClick}
            label={
              <React.Fragment>
                <Icon name='caret left' />
                <span>{label}</span>
              </React.Fragment>
            }
          />
        </div>
      }
    />
  );
}

BackLink.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  history: historyPropType.isRequired
};

export default withRouter(BackLink);
