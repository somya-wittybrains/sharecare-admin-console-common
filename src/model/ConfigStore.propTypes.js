import PropTypes from 'prop-types';

const propTypes = {
  ssoHost: PropTypes.string.isRequired,
  ssoId: PropTypes.string.isRequired,
  init: PropTypes.func.isRequired
};

export default propTypes;
