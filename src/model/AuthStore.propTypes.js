import PropTypes from 'prop-types';

const propTypes = {
  url: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  modules: PropTypes.arrayOf(PropTypes.string).isRequired,
  roles: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  refreshed: PropTypes.number.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  authenticate: PropTypes.func.isRequired,
  deAuthenticate: PropTypes.func.isRequired
};

export default propTypes;
