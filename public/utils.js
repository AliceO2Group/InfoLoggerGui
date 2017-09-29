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

/**
 * Parse a human date string and returns a javascript Date, default date is now
 * @param {String} human date - Eg: -5m means five minutes ago
 * @return {Date} the parsed date
 */
$.parseDate = function(humanString) {
  const date = new Date(); // let's begin by 'now' and modify it according to regexes

  // Array of regex to find something to parse with their setters on Date object.
  // Must follow the same pattern, only last letter change.
  // +- mandatory
  // number optional
  // space optional
  // first letter of modifier
  // rest of the modifier optional (m means minutes)
  const relatives = [
    {
      reg: /([-+])([0-9]*)\s?s/i,
      setter: 'setSeconds',
      getter: 'getSeconds'
    },
    {
      reg: /([-+])([0-9]*)\s?m/i,
      setter: 'setMinutes',
      getter: 'getMinutes'
    },
    {
      reg: /([-+])([0-9]*)\s?h/i,
      setter: 'setHours',
      getter: 'getHours'
    },
    {
      reg: /([-+])([0-9]*)\s?d/i,
      setter: 'setDate',
      getter: 'getDate'
    }
  ];

  // Apply absolute changes (eg: 12/03/16 or 10:00:05.000)

  const regTime = /([0-9]+):([0-9]*):?([0-9]*).?([0-9]*)/i;
  const regTimeResult = regTime.exec(humanString);
  if (regTimeResult) {
    date.setHours(parseInt(regTimeResult[1], 10));
    date.setMinutes(parseInt(regTimeResult[2] || 0, 10)); // set zero if not set
    date.setSeconds(parseInt(regTimeResult[3] || 0, 10));
    date.setMilliseconds(parseInt(regTimeResult[4] || 0, 10));
  }

  const regDate = /([0-9]+)\/([0-9]*)\/?([0-9]*)\/?([0-9]*)/i;
  const regDateResult = regDate.exec(humanString);
  if (regDateResult) {
    date.setDate(parseInt(regDateResult[1], 10));
    if (regDateResult[2]) { // don't set if not set
      date.setMonth(parseInt(regDateResult[2], 10) - 1); // zero-based
    }
    if (regDateResult[3]) { // don't set if not set
      let newYear = parseInt(regDateResult[3], 10); // zero-based
      if (newYear < 100) { // 20 => 2020
        newYear += 2000;
      }
      date.setYear(newYear);
    }
  }

  // Apply relative changes (eg: +- 5 minutes)

  for (let i = 0, relative; relative = relatives[i]; i++) {
    const regResult = relative.reg.exec(humanString);
    if (regResult) {

      const sign = regResult[1]; // sign is mandatory
      const number = parseInt(regResult[2] || 1, 10); // empty means one in human language

      // Change the date by the amount given by user
      // Javascript will handle well if the numbers are too big
      // Example: -65m ~=> -1h -5m
      if (sign === '-') {
        date[relative.setter](date[relative.getter]() - number);
      } else {
        date[relative.setter](date[relative.getter]() + number);
      }
    }
  }

  return date;
}
