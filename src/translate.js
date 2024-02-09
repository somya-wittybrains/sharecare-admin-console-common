// Adapted from SO
// @see https://stackoverflow.com/a/18234317
// TODO shoudl be replaced by proper translation support.
// In the meantime, this allows to fake translation and pass arguments.
// Later, it should be much easier to find all t() calls.
const t = (string, ...args) => {
  let str = string.toString();
  if (args.length) {
    const t = typeof args[0];
    const map = 'string' === t || 'number' === t ? args : args[0];

    for (let key in map) {
      str = str.replace(new RegExp('\\{{' + key + '\\}}', 'gi'), map[key]);
      str = str.replace(new RegExp('\\{' + key + '\\}', 'gi'), map[key]);
    }
  }
  return str;
};

export { t };
