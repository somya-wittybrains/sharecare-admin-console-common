import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Header, Accordion, Icon, Segment } from 'semantic-ui-react';
import { t } from 'translate';
import { ReactComponent as Image } from 'controls/error-cloud.svg';

const CustomError = ({ componentStack, error }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Segment
      basic
      padded='very'
      textAlign='center'
      style={{
        paddingTop: '5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Header as='h2' icon>
        <Icon as={Image} style={{ marginBottom: '2rem' }} />
        {t('Oops, something went wrong...')}
        <Header.Subheader style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          {t('An error occured!')}
        </Header.Subheader>
      </Header>
      <Accordion>
        <Accordion.Title
          active={showDetails}
          onClick={() => setShowDetails(!showDetails)}
        >
          <Icon name='dropdown' />
          {t('Show details')}
        </Accordion.Title>
        <Accordion.Content active={showDetails}>
          <Segment
            basic
            padded='very'
            textAlign='left'
            style={{ paddingTop: 0 }}
          >
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              <strong>Error:</strong> {error.toString()}
            </pre>
            <pre style={{ overflow: 'auto' }}>
              <strong>Stacktrace:</strong> {componentStack}
            </pre>
          </Segment>
        </Accordion.Content>
      </Accordion>
    </Segment>
  );
};

CustomError.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired,
  componentStack: PropTypes.shape({
    componentStack: PropTypes.string
  }).isRequired
};

export default function ErrorBoundary (props) {
  return <ReactErrorBoundary FallbackComponent={CustomError} {...props} />;
}
