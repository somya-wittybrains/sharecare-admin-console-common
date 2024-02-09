import React from 'react';
import { Item, Popup, Icon } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';
import { t } from 'translate';
import { ReactComponent as TeamSeries } from './teams-series.svg';
import { ReactComponent as IndividualSeries } from './challenge-series-ind.svg';

const TemplateIconComponent = observer(
  ({
    challengeId,
    templateId,
    templateName,
    asTemplateIndicator,
    onLinkClick = null
  }) => {
    return (
      <React.Fragment>
        <Popup
          inverted
          content={
            <React.Fragment>
              <div
                onClick={event => event.stopPropagation()}
                style={{ textAlign: 'center' }}
              >
                <Item as='label' style={{ opacity: '0.75' }}>
                  {t('Template Clone (Click Icon to View):')}
                </Item>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Item as='span'>{templateName}</Item>
              </div>
            </React.Fragment>
          }
          trigger={
            <Icon
              as={asTemplateIndicator}
              onClick={event => {
                event.stopPropagation();
                if (onLinkClick) onLinkClick(templateId);
              }}
              style={{
                position: 'relative',
                top: 4,
                marginRight: 10,
                cursor: onLinkClick ? 'pointer' : 'none'
              }}
            />
          }
        />
      </React.Fragment>
    );
  }
);
const ChallengeTypeComponent = observer(
  ({
    challengeType,
    name,
    challengeId,
    postPendText = 'Challenge',
    templateName,
    templateId,
    onLinkClick,
    asTemplateIndicator
  }) => {
    return (
      <React.Fragment>
        {challengeType === 'team' && (
          <Popup
            inverted
            content={`Team ${postPendText}`}
            trigger={<Icon style={{ marginRight: 10 }} name='users' />}
          />
        )}
        {challengeType === 'individual' && (
          <Popup
            inverted
            content={`Individual ${postPendText}`}
            trigger={<Icon style={{ marginRight: 10 }} name='user' />}
          />
        )}
        {challengeType === 'personal' && (
          <Popup
            inverted
            content={`Personal ${postPendText}`}
            trigger={<Icon style={{ marginRight: 10 }} name='star' />}
          />
        )}
        {challengeType === 'individual_series' && (
          <Popup
            inverted
            content={`Individual Series`}
            trigger={<IndividualSeries style={{ marginRight: 10 }} />}
          />
        )}
        {challengeType === 'team_series' && (
          <Popup
            inverted
            content={`Team Series`}
            trigger={<TeamSeries style={{ marginRight: 10 }} />}
          />
        )}
        {templateId && (
          <TemplateIconComponent
            challengeId={challengeId}
            templateId={templateId}
            templateName={templateName}
            onLinkClick={onLinkClick}
            asTemplateIndicator={asTemplateIndicator}
          />
        )}
        {name && <span>{name}</span>}
      </React.Fragment>
    );
  }
);
export default ChallengeTypeComponent;
