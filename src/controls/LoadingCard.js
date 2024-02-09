import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'semantic-ui-react';
import LoadingSegment from 'controls/LoadingSegment';

export default function LoadingCard ({ title, ...props }) {
  return (
    <Card centered {...props}>
      <Card.Content>
        <Card.Header>{title}</Card.Header>
      </Card.Content>
      <Card.Content extra>
        <LoadingSegment basic />
      </Card.Content>
    </Card>
  );
}

LoadingCard.propTypes = {
  title: PropTypes.string.isRequired
};
