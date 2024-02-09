export const timezoneMap = {
	'America/New_York': 'Eastern',
	'America/Chicago': 'Central',
	'America/Denver': 'Mountain',
	'America/Phoenix': 'Mountain (Arizona)',
	'America/Los_Angeles': 'Pacific',
	'America/Anchorage': 'Alaska',
	'Pacific/Honolulu': 'Hawaii'
};

export const reverseTimezoneMap = {};
Object.keys(timezoneMap).forEach(timezoneMapKey => {
	reverseTimezoneMap[timezoneMap[timezoneMapKey]] = timezoneMapKey;
});
