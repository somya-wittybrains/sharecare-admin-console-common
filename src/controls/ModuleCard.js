import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, Image, Label } from 'semantic-ui-react';
import GracefulIcon from 'controls/GracefulIcon';
import { t } from 'translate';

export default function ModuleCard ({
  title: header,
  description,
  iconComponent,
  path,
  isSystemModule = false
}) {
  return (
    <Card as={Link} to={`/${path}`}>
      <Card.Content textAlign='center'>
         {isSystemModule && (<Label attached='top right' style={{background: '#09c199', color: '#fff'}}>{t('SYSTEM ADMIN')}</Label>)}
        <Image
          as={GracefulIcon}
          path={iconComponent}
          centered
          style={{
            height: 98,
            marginTop: 12,
            marginBottom: 12,
            background: 'none',
            color: 'rgb(26, 186, 156)',
            display: 'flex',
            alignItems: 'center'
          }}
        />
        <Card.Header textAlign='center' content={header} />
        <Card.Description textAlign='center' content={description} />
      </Card.Content>
    </Card>
  );
}

ModuleCard.propTypes = {
  iconComponent: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  path: PropTypes.string.isRequired
};
