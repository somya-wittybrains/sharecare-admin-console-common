const request = require('request-promise-native').defaults({ json: true });
const router = ExpressRest.Router();

router.use(async (req, res, next) => {
  try {
    const host = req.hostname;
    const apiResponse = await request({
        method: req.method,
        url: `${host}/api`,
        body: req.body,
        headers: req.headers,
        resolveWithFullResponse: true    
    })
    res.status(apiResponse.statusCode).json(apiResponse.body);
  } catch (err) {
    res.status(err.statusCode).json(err);
  }
});

module.exports = router;
