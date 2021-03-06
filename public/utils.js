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
 * @param {string} human date - Eg: -5m means five minutes ago
 * @param {string} tz - optional timezone, default to local
 * @return {date} the parsed date or null if empty
 */
$.parseDate = function(humanString, tz) {
  if (!humanString) {
    return null;
  }
  tz = tz || LOCAL_TIMEZONE;

  const date = moment().tz(tz); // let's begin by 'now' and modify it according to regexes

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
      setter: 'seconds',
      getter: 'seconds'
    },
    {
      reg: /([-+])([0-9]*)\s?m/i,
      setter: 'minutes',
      getter: 'minutes'
    },
    {
      reg: /([-+])([0-9]*)\s?h/i,
      setter: 'hours',
      getter: 'hours'
    },
    {
      reg: /([-+])([0-9]*)\s?d/i,
      setter: 'date',
      getter: 'date'
    }
  ];

  // Absolute: [DD/[MM[/YYYY]]] and set hour to midnight

  const regDate = /([0-9]+)\/(([0-9]+)(\/([0-9]+)(\/([0-9]+))?)?)?/i;
  const regDateResult = regDate.exec(humanString);
  if (regDateResult) {
    date.date(parseInt(regDateResult[1], 10)); // mandatory day
    if (regDateResult[3]) { // optional month
      date.months(parseInt(regDateResult[3], 10) - 1); // zero-based
    }
    if (regDateResult[5]) { // optional year
      let newYear = parseInt(regDateResult[5], 10); // zero-based
      if (newYear < 100) { // 20 => 2020
        newYear += 2000;
      }
      date.years(newYear);
    }

    // Midnight of this day
    date.hours(0);
    date.minutes(0);
    date.seconds(0);
    date.milliseconds(0);
  }

  // Absolute: [hh:[mm[:ss[.mmm]]] and keep the day previously set

  const regTime = /([0-9]+):(([0-9]*)(:([0-9]*)(\.([0-9]*))?)?)?/i;
  const regTimeResult = regTime.exec(humanString);
  if (regTimeResult) {
    date.hours(parseInt(regTimeResult[1], 10));
    date.minutes(parseInt(regTimeResult[3] || 0, 10)); // set zero if not set
    date.seconds(parseInt(regTimeResult[5] || 0, 10));
    date.milliseconds(parseInt(regTimeResult[7] || 0, 10));
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

/**
 * Generate a datetime representation string (compatible with parser)
 * @param {number|string|date} timestamp - 1456135200002.017
 * @param {string} format - 'datetime' or 'date' or 'time'
 * @param {string} tz - timezone normalized like 'Europe/Zurich'
 * @return {string} dd/mm/yyyy HH:MM:SS.mmm
 */
$.datetime = function(timestamp, format, tz) {
  if (typeof timestamp === 'string') {
    timestamp = parseFloat(timestamp, 10);
  }
  if (typeof timestamp === 'number') {
    timestamp = timestamp * 1000; // seconds to ms
  }
  tz = tz || LOCAL_TIMEZONE;

  if (format === 'datetime') {
    // zz is the timezone like 'Europe/Zurich', CET (Central European Time), CEST, etc.
    return moment(timestamp).tz(tz).format('DD/MM/GGGG HH:mm:ss.SSS zz');
  } else if (format === 'date') {
    return moment(timestamp).tz(tz).format('DD/MM/GGGG');
  } else {// time
    return moment(timestamp).tz(tz).format('HH:mm:ss.SSS');
  }
}
