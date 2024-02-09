import PropTypes from 'prop-types';

const propTypes = {
  timestamp: PropTypes.number.isRequired,
  status: PropTypes.number.isRequired,
  error: PropTypes.string.isRequired,
  fetch: PropTypes.func.isRequired,
  clearError: PropTypes.func.isRequired
};

export default propTypes;
