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

/**
 * Generate a random base 36 id, 10 chars, to be used in template to identify rows
 * @return {string} the fake id
 */
$.virtualId = function() {
  return Math.random().toString(36).substr(2, 12);
}

/**
 * Put the content of el into the clipboard of the user
 * @param {DOMNode} el
 */
$.toClipboard = function(el) {
  let body = document.body;
  let range;
  let sel;
  if (document.createRange && window.getSelection) {
    range = document.createRange();
    sel = window.getSelection();
    sel.removeAllRanges();
    try {
      range.selectNodeContents(el);
      sel.addRange(range);
    } catch (e) {
      range.selectNode(el);
      sel.addRange(range);
    }
    document.execCommand('copy');
  } else if (body.createTextRange) {
    range = body.createTextRange();
    range.moveToElementText(el);
    range.select();
    range.execCommand('Copy');
  }
}
