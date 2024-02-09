require('newrelic');
const path = require('path');
const ExpressRest = require('@sharecare/express-rest');
const HealthCheckController = require('@sharecare/healthcheck');
const { createProxyMiddleware  } = require('http-proxy-middleware');
//const config = require('config');
//const logger = require('./debug-logger').createLogger('serveProxy');
//const binding = config.get('bind');
//const routing = config.get('route');
const port = 3000;
const expressConfig = new ExpressRest.Config(`${port}`, `/`);
expressConfig.access = false;
expressConfig.static = true;
expressConfig.staticPrefix = '/';
expressConfig.staticPath = 'public';
expressConfig.staticOptions = {
  maxAge: 43200, // The `maxAge` and `immutable` settings, set this way, are supposed to take effect, but are not taking effect.  Is this because a Cache-Control response header has already been set by @sharecare/express-rest?  Regardless the cause, we can overcome the problem by using the `setHeaders` hook instead - see below.
  setHeaders: res => {
    res.setHeader('Cache-Control', 'max-age=43200'); // 12 hours.  Note:  We _don't_ combine this with immutable.  Consequently, the browser does check for updates, but won't redownload large files every time.  (The server will advise the client most times that the file has not changed.)
  }
};
expressConfig.jsonLimit = '20000mb';
expressConfig.staticDefaultEndpoint = path.join(
  __dirname,
  '/public/index.html'
);
const healthCheck = new HealthCheckController();
const healthCheckFilter = router => healthCheck.build(router);

const prometheus = require('@sharecare/prometheus-client');
const prometheusFilter = () => prometheus.middleware();
let sourceHost='';
process.on('uncaughtException', err => {
  //logger.error(`Care Console uncaughtException: ${err?.stack || err?.message}`);
});

process.on('unhandledRejection', err => {
  /*logger.error(
    `Care Console unhandledRejection: ${err?.stack || err?.message}`
  );*/
});
const app = ExpressRest(expressConfig, null, [
  healthCheckFilter,
  prometheusFilter
]);

app.use('/api', require('proxy-controller'));
