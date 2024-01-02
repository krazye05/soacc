export default {
  rebuildObject: (value) => JSON.parse(JSON.stringify(value)),
  isNullOrUndefined: (value) => ["", null, undefined].includes(value),
};
