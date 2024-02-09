import React from 'react';
import PropTypes from 'prop-types';
import { Container, Card } from 'semantic-ui-react';
import LoadingSegment from 'controls/LoadingSegment';

export default function CardPage ({ title, content }) {
  return (
    <Container
      fluid
      style={{
        width: 400,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: '10%'
      }}
    >
      {content || (
        <Card centered>
          <Card.Content>
            <Card.Header>{title}</Card.Header>
          </Card.Content>
          <Card.Content extra>
            <LoadingSegment basic />
          </Card.Content>
        </Card>
      )}
    </Container>
  );
}

CardPage.propTypes = {
  title: PropTypes.string,
  content: PropTypes.element
};
