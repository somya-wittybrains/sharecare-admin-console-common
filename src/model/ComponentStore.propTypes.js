import PropTypes from 'prop-types';

const propTypes = {
  components: PropTypes.arrayOf(PropTypes.object).isRequired,
  load: PropTypes.func.isRequired
};

export default propTypes;
