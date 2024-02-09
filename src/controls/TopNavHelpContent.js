import React from 'react';
import PropTypes from 'prop-types';
import { t } from '../translate';
import { Header, Grid, Divider, Item, Icon } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';

const defaultNotes = t(
  'Need assistance? Please contact your Sharecare system administrator.'
);
const defaultUrl = 'https://support.you.sharecare.com/hc/en-us';

const TopNavHelpContent = observer(
  ({ email, phoneNumber, url, notes, version, buildNumber, onClose }) => {
    return (
      <Grid padded columns={1}>
        <Grid.Row>
          <Grid.Column>
            <Header as='h3'>
              {t('Support')}
              {false && (
                <Item
                  onClick={() => {
                    onClose();
                  }}
                  as='a'
                  style={{
                    float: 'right',
                    color: '#c5d0de',
                    cursor: 'pointer'
                  }}
                >
                  <Icon
                    name='close'
                    style={{ marginRight: 0 }}
                    onClick={() => {
                      onClose();
                    }}
                  />
                </Item>
              )}
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>{notes || defaultNotes}</Grid.Column>
        </Grid.Row>
        {!!email && (
          <Grid.Row>
            <Grid.Column>
              <Header as='h4'>{t('Support Email')}</Header>
              <a href={`mailto:${email}`}>{email}</a>
            </Grid.Column>
          </Grid.Row>
        )}
        {!!phoneNumber && (
          <Grid.Row>
            <Grid.Column>
              <Header as='h4'>{t('Support Phone Number')}</Header>
              <a href={`tel:${phoneNumber}`}>{phoneNumber}</a>
            </Grid.Column>
          </Grid.Row>
        )}
        <Grid.Row>
          <Grid.Column>
            <Header as='h4'>{t('Support URL')}</Header>
            <a
              href={url || defaultUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              {url || defaultUrl}
            </a>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Divider />
            <Header as='h4'>
              {t('VERSION :')}

              {version && (
                <span
                  style={{
                    margin: '0 3px',
                    fontWeight: '400',
                    color: '#5c5d5d'
                  }}
                >
                  {version}
                </span>
              )}
              {buildNumber && (
                <span style={{ fontWeight: '100', color: '#5c5d5d' }}>
                  ({buildNumber})
                </span>
              )}
            </Header>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
);

TopNavHelpContent.propTypes = {
  email: PropTypes.string,
  phoneNumber: PropTypes.string,
  url: PropTypes.string,
  notes: PropTypes.string
};

export default TopNavHelpContent;
