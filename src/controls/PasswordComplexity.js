import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Item } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';

const PasswordComplexityLineItem = observer(({ text, isValid }) => {
  return (
    <React.Fragment>
      <div>
        <Icon
          name={isValid ? 'check circle' : 'times circle'}
          style={{ color: isValid ? '#00bfa5' : 'red' }}
        />
        <span>{text}</span>
      </div>
    </React.Fragment>
  );
});
const PasswordComplexity = observer(
  ({ passwordComplexity = [], rules = [] }) => {
    return (
      <Item style={{ lineHeight: '1.8', padding: '8px 0' }}>
        {passwordComplexity &&
          passwordComplexity.map((value, index) => (
            <PasswordComplexityLineItem
              isValid={value}
              text={rules && rules.length !== 0 ? rules[index].description : ''}
            />
          ))}
      </Item>
    );
  }
);

PasswordComplexity.propTypes = {
  passPasswordComplexity: PropTypes.object.isRequired,
  rules: PropTypes.array.isRequired
};

export default PasswordComplexity;
