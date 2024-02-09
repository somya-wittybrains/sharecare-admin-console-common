import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Popup, Menu, Icon, Image } from 'semantic-ui-react';
import ActionModal from 'controls/ActionModal';

const confirmPropType = PropTypes.shape({
  as: PropTypes.func
});

export default function ActionMenuItem (props) {
  if (props.confirmProps) {
    if (props.onClick) {
      // eslint-disable-next-line no-console
      console.warn(
        'onClick + confirmProps are incompatible, onClick is ignored'
      );
    }
    return <ActionConfirmationMenuItem {...props} />;
  }

  const {
    name,
    icon,
    image,
    label,
    hint,
    negative,
    level = 'secondary',
    as = 'div',
    popupText = '',
    informationalIconName = null,
    informationalIconColor = null,
    rotated = null,
    on = 'hover',
    ...rest
  } = props;
  const color = negative ? 'red' : undefined;

  return (
    <Menu.Item
      {...rest}
      name={name}
      color={color}
      as={as}
      className={negative ? undefined : level}
    >
      <Popup
        inverted
        disabled={popupText === ''}
        position='top center'
        content={popupText}
        on={on}
        popper={<div style={{ filter: 'none' }}></div>}
        trigger={
          <div>
            {icon && <Icon name={icon} color={color} rotated={rotated} />}
            {image && <Image style={{ marginRight: 5 }} src={image} />}
            <div style={{ width: '100%' }}>
              <strong>{label}</strong>
              {hint && <small>{hint}</small>}
            </div>
            {informationalIconName && (
              <Icon
                name={informationalIconName}
                style={{ cursor: 'pointer', color: informationalIconColor }}
              />
            )}
            {level === 'menuselected' && <Icon name='caret right' />}
          </div>
        }
      />
    </Menu.Item>
  );
}

ActionMenuItem.propTypes = {
  name: PropTypes.string,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  negative: PropTypes.bool,
  level: PropTypes.oneOf([
    'primary',
    'secondary',
    'tertiary',
    'selected',
    'notselected'
  ]),
  onClick: PropTypes.func,
  as: PropTypes.any,
  confirmProps: confirmPropType
};

function ActionConfirmationMenuItem ({
  confirmProps: { as, ...confirmProps },
  ...props
}) {
  const [confirm, setConfirm] = useState(false);
  const Component = as || ActionModal;

  return (
    <Component
      trigger={<ActionMenuItem {...props} onClick={() => setConfirm(true)} />}
      {...confirmProps}
      open={confirm}
      onClose={() => setConfirm(false)}
    />
  );
}

ActionConfirmationMenuItem.propTypes = {
  confirmProps: confirmPropType
};
