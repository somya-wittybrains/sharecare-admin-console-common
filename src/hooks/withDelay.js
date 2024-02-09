const withDelay = (delay, effect) => (...args) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(effect(...args));
    }, delay);
  });

module.exports = {
  withDelay
};
