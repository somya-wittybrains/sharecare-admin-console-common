import PropTypes from 'prop-types';

const propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  removeNotification: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired
};

export default propTypes;
