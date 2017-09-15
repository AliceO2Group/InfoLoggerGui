// Escape html for raw templating
function htmlEscape(str) {
  if (!str) {
    return '';
  }
  if (typeof str !== 'string') {
    str = new String(str);
  }
  return str.replace(/&/g, '&amp;') // first!
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/`/g, '&#96;');
}
