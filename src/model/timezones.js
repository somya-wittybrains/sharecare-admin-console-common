import moment from 'moment-timezone';

const TIMEZONES = moment.tz ? moment.tz.names() : [];

export default TIMEZONES;
