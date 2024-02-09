import React from 'react';
import PropTypes from 'prop-types';
import './Box.less';

const sizes = 'tiny,small,medium,large,big'.split(',');
const paddingProps = 'p,py,px,pt,pr,pb,pl'.split(',');
const marginProps = 'm,my,mx,mt,mr,mb,ml'.split(',');

const makeClassList = (availableProps, props) =>
  availableProps
    .map(name => sizes.includes(props[name]) && `${name}-${props[name]}`)
    .filter(Boolean);

export default function Box ({ as: Component = 'div', ...props }) {
  const {
    m,
    my,
    mx,
    mt,
    mr,
    mb,
    ml,
    p,
    py,
    px,
    pt,
    pr,
    pb,
    pl,
    ...rest
  } = props;
  const classList = [
    ...makeClassList(paddingProps, props),
    ...makeClassList(marginProps, props)
  ];
  return <Component className={classList.join(' ')} {...rest} />;
}

Box.propTypes = {
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  m: PropTypes.oneOf(sizes),
  my: PropTypes.oneOf(sizes),
  mx: PropTypes.oneOf(sizes),
  mt: PropTypes.oneOf(sizes),
  mr: PropTypes.oneOf(sizes),
  mb: PropTypes.oneOf(sizes),
  ml: PropTypes.oneOf(sizes),
  p: PropTypes.oneOf(sizes),
  py: PropTypes.oneOf(sizes),
  px: PropTypes.oneOf(sizes),
  pt: PropTypes.oneOf(sizes),
  pr: PropTypes.oneOf(sizes),
  pb: PropTypes.oneOf(sizes),
  pl: PropTypes.oneOf(sizes)
};
