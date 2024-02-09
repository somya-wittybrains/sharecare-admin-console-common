const fs = require('fs');
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version + '-' + process.env.GITHUB_RUN_NUMBER;
fs.writeFileSync('public/version.json', JSON.stringify({version}));
