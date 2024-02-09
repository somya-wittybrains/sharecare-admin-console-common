import React from 'react';
import PropTypes from 'prop-types';
import { Popup, Icon, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const colorMap = {
  key: '#09c199',
  pencil: '#1991eb',
  upload: '#1991eb',
  download: '#1991eb',
  mail: '#09c199'
  //,
  //'id badge': '#ee6723',
  //'list layout': '#1991eb',
  //'exclamation triangle': '#f5a623'
};

export default function ActionIcon ({
  name,
  src,
  content,
  onClick,
  to,
  width,
  disabled,
  preventDisabledPaddingDifference,
  textColor,
  color: iconColor,
  fontSize,
  spanText = '',
  on = 'hover',
  ...props
}) {
  const color = iconColor ? iconColor : colorMap[name];
  const OuterComponent = to ? Link : 'span';

  return (
    <Popup
      inverted
      on={on}
      popper={<div style={{ filter: 'none' }}></div>}
      trigger={
          <OuterComponent
            style={
              disabled
                ? preventDisabledPaddingDifference
                  ? { padding: '.5em 0.25em' }
                  : {}
                : {
                    padding: '.5em 0.25em',
                    cursor: !disabled ? 'pointer' : 'not-allowed'
                  }
            }
            onClick={disabled ? null : onClick}
            to={to}
          >
            {src && (
              <i className='icon'>
                <Image width={width} src={src} color={color} />
              </i>
            )}
            {!src && (
              <Icon
                name={name}
                src={src}
                as={src ? Image : null}
                disabled={disabled}
                {...props}
                style={
                  width
                    ? { width: width, color: color, fontSize }
                    : { color, fontSize }
                }
              />
            )}
            <span style={{ color: textColor }}>{spanText}</span>
          </OuterComponent>
      }
      content={content}
    />
  );
}

ActionIcon.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  to: PropTypes.string,
  disabled: PropTypes.bool
};
