// code extracted from lodash, see https://lodash.com/docs/4.17.15#escapeRegExp
export function sanitizeRegexString(str: string) {
  if (typeof str !== 'string') throw new Error();
  const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  const reHasRegExpChar = RegExp(reRegExpChar.source);
  return str && reHasRegExpChar.test(str) ? str.replace(reRegExpChar, '\\$&') : str;
}
