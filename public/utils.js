/**
 * Escape html for raw templating
 * @param {string} str - '<'
 * @return {string} '&lt;'
 */
$.escapeHTML = function(str) {
  if (!str) {
    return '';
  }
  if (typeof str !== 'string') {
    str = String(str);
  }
  return str.replace(/&/g, '&amp;') // first!
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
};
