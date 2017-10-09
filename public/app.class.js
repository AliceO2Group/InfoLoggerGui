/* globals Observable,appConfig */

/**
 * App model containing all data, methods, ajax calls of this application
 * It runs on its own and views can 'observe' for changes to redraw.
 */
class App extends Observable {
  /**
   * Constructor, declares default properties and init Observable super class
   */
  constructor(ws) {
    super();

    this.ws = ws; // websocket connection
    this.wsState = 'closed'; // closed, connecting, authentication, open
    this.logsLoaded = []; // to be shown
    this.liveStarted = false; // websocket gets new data
    this.inspectorActivated = true; // right panel displaying current row selected
    this.selectedRow = null;
    this.autoScrollEnabled = true;
    this.maxLogs = 10000;
    this.queyTime = 0;
    this.querying = false; // loading data from a query
    this.reconnectTimer = 0;

    this.total = 0; // total rows found, can be smaller than logsLoaded.length
    this.fatals = 0;
    this.errors = 0;
    this.warnings = 0;
    this.infos = 0;

    this.columns = { // display or not
      date: false,
      time: true,
      severity: true,
      level: false,
      hostname: false,
      rolename: true,
      pid: false,
      username: false,
      system: true,
      facility: false,
      detector: false,
      partition: false,
      run: false,
      errcode: true,
      errline: false,
      errsource: false,
      message: true
    };

    this.rawFilters = {}; // copy of user inputs
    this.filters = {}; // parsed version with type casting

    ws.element.bind('websocketmessage', (evt, message) => {
      this.onLiveMessage(message.payload);
    });

    ws.element.bind('websocketauthed', (evt, message) => {
      console.log('WS authed, messages can be sent');
      this.wsState = 'open';
      this.reconnect();
      this.notify();
    });

    ws.element.bind('websocketopen', (evt, data) => {
      console.log('WS open, waiting for authentication');
      this.wsState = 'authentication';
      this.notify();
    });

    ws.element.bind('websocketclose', (evt, data) => {
      console.log('WS close');
      this.wsState = 'close';

      const isAuthError = data.code && data.code.code === 1008;
      if (!isAuthError) {
        this.reconnect();
      }

      this.notify();
    });
  }

  /**
   * Reconnect ws when connection is lost, 2s between tries
   */
  reconnect() {
    if (this.wsState !== 'close') {
      return;
    }
    this.wsState = 'connecting';
    this.notify();

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      console.log('WS reconnecting now...');
      ws._connect();
    }, 2000);
  }

  /**
   * Query server for logs stored in DB
   * @return {xhr} jquery ajax instance
   */
  query() {
    // first, stop real-time if set
    if (this.live()) {
      this.live(false);
    }

    // jquery does not know how to stringify a deep object, so we JSON.stringify
    // and we need to set content-type too (form-www-encoded by default)
    const startTiming = new Date();
    this.querying = true;
    this.notify();

    return $.ajax({
      url: '/api/query?token=' + appConfig.token,
      method: 'POST',
      data: JSON.stringify({filters: this.filters, limit: this.maxLogs}),
      contentType: 'application/json',
      success: (result) => {
        // Logs don't have any unique id, so we generate one
        result.rows.forEach((row) => row.virtualId = $.virtualId());

        this.queyTime = new Date() - startTiming;
        this.logs(result.rows);
        this.total = result.total;
      },
      complete: () => {
        this.querying = false;
        this.notify();
      }
    });
  }

  /**
   * Getter/setter of live mode state, if argument is provided it tells the server to start/stop
   * sending logs by websocket
   * @param {bool} enabled - (optional) start/stop live mode
   * @return {bool} live mode state
   */
  live(enabled) {
    if (!arguments.length) {
      return this.liveStarted;
    }

    if (this.wsState !== 'open') {
      return alert('Sorry, connection is not yet ready');
    }

    if (enabled) {
      // first, empty all logs, then listen for new ones
      this.logs([]);
      this.total = 0;
      this.liveStarted = true;
      this.queyTime = 0; // no querytime with real-time
      this.selectedRow = null;
      this.notify();

      const filters = this.filters;

      // This function will be stringified then sent to server so it can filter logs
      // 'data' will be replaced by the stringified filters too so the function contains de data
      function fn(message) {
        const filters = 'data';

        for (const field in filters) {
          let messageValue = message[field];
          if (field === 'timestamp') {
            messageValue = new Date(message[field] * 1000);
          }

          for (const operator in filters[field]) {
            let criteriaValue = filters[field][operator];
            if (field === 'timestamp') {
              criteriaValue = new Date(criteriaValue);
            }

            if (operator === '$in' && criteriaValue.indexOf(messageValue) === -1) {
              return false;
            } else if (operator === '$nin' && messageValue && criteriaValue.indexOf(messageValue) >= 0) {
              return false;
            } else if (operator === '$gte' && messageValue < criteriaValue) {
              return false;
            } else if (operator === '$lte' && messageValue > criteriaValue) {
              return false;
            }
          }
        }
        return true;
      }

      this.ws.setFilter(fn.toString().replace('\'data\'', JSON.stringify(this.filters)));
    } else {
      this.liveStarted = false;
      this.queyTime = 0; // no querytime with real-time
      this.notify();

      this.ws.setFilter(function(message) {
        return false;
      });
    }

    return this.liveStarted;
  }

  /**
   * Inserts log into list and notify observers
   * @param {string} log - log object to be inserted
   */
  onLiveMessage(log) {
    if (!this.liveStarted) {
      // server is sending but we did not ask to
      // to be fixed in Gui
      // https://alice.its.cern.ch/jira/browse/OGUI-77
      this.ws.setFilter(function(message) {
        return false;
      });
      return;
    }

    // Logs don't have any unique id, so we generate one
    log.virtualId = $.virtualId();
    this.total++;

    this.logs(log, true);
    this.notify();
  }

  /**
   * Empty all logs stored
   */
  empty() {
    this.logs([]);
    this.queyTime = 0;
    this.total = 0;
    this.selectedRow = null;
    this.notify();
  }

  /**
   * Set if a field should be displayed or not
   * @param {string} fieldName - field to be set
   * @param {boolean} value - display or not
   */
  displayField(fieldName, value) {
    this.columns[fieldName] = value;
    this.notify();
  }

  /**
   * Getter/setter for input field, this also update the parsed/casted filters
   * @param {string} field - name of the column
   * @param {string} operator - criteria to apply to the column
   * @param {string} value - the string given by user
   * @return {string} always a string, to show to user
   */
  rawFilter(field, operator, value) {
    // Set raw filter
    if (arguments.length === 3) {
      console.log(`Set filter ${field} ${operator} ${value}`);
      if (!value) {
        if (this.rawFilters[field]) {
          // empty value, don't keep useless information
          delete this.rawFilters[field][operator];

          // remove also the fields widthout any value
          if (Object.keys(this.rawFilters[field]).length === 0) {
            delete this.rawFilters[field];
          }
        }
      } else {
        if (!this.rawFilters[field]) {
          this.rawFilters[field] = {};
        }
        this.rawFilters[field][operator] = value;
      }

      // Set parsed filter
      this.filters = {};
      for (const field in this.rawFilters) {
        this.filters[field] = {};

        for (const operator in this.rawFilters[field]) {
          // Cast special values
          let parsedValue = this.rawFilters[field][operator];
          if (field === 'timestamp') {
            parsedValue = $.parseDate(parsedValue);
          } else if (operator === '$in') {
            parsedValue = parsedValue.split(' ');
          } else if (operator === '$nin') {
            parsedValue = parsedValue.split(' ');
          }

          // Bad values like NaN, null, invalid date
          if (!parsedValue) {
            continue;
          }

          this.filters[field][operator] = parsedValue;
        }
      }

      // Notify
      this.notify();
    }

    // Get raw value, always a string
    if (!this.rawFilters[field] || !this.rawFilters[field][operator]) {
      return '';
    }

    return this.rawFilters[field][operator];
  }

  /**
   * Getter for the parsed filters
   * @param {string} field - name of the column
   * @param {string} operator - criteria to apply to the column
   * @return {string|date|number} the parsed value associated to this filter
   */
  parsedFilters(field, operator) {
    if (!this.filters[field]) {
      return null;
    }

    return this.filters[field][operator];
  }

  /**
   * Getter/setter for the row selected in the table, we use virtualId as an id
   * @param {object|string} row - the row to be selected, or its virtualId
   * @return {object} the row selected or null
   */
  selected(row) {
    if (arguments.length) {
      if (typeof row === 'string') {
        // if we set by the virtualId
        row = this.logsLoaded.find((log) => log.virtualId === row)
      }
      this.selectedRow = row;
      this.notify();
    }

    return this.selectedRow;
  }

  /**
   * Move current cursor by `n` rows
   * @param {Number} n - can be negative or positive
   */
  moveRow(n) {
    if (!this.logsLoaded.length) {
      return;
    }

    const currentSelected = this.selected();
    if (!currentSelected) {
      this.selected(this.logsLoaded[0]);
      return;
    }

    const currentIndex = this.logsLoaded.indexOf(currentSelected);
    const newIndex = Math.min(Math.max(currentIndex + n, 0), this.logsLoaded.length - 1); // [0 ; length-1]

    this.selected(this.logsLoaded[newIndex].virtualId);
  }

  /**
   * Move current cursor by `n` rows, but only errors
   * @param {Number} n - negative or positive number, Infinity for first and last error
   */
  moveSelectedError(n) {
    if (!this.logs.length) {
      return;
    }

    const errors = this.logsLoaded.filter(log => log.severity === 'E');

    const currentSelected = this.selected();
    if (!currentSelected) {
      // nothing selected, just select the first error
      this.selected(errors[0]);
      return;
    }

    const currentIndex = errors.indexOf(currentSelected);
    const newIndex = Math.min(Math.max(currentIndex + n, 0), errors.length - 1); // [0 ; length-1]

    this.selected(errors[newIndex].virtualId);
  }

  /**
   * Getter/setter for logs, can append with second arg
   * @param {array|object} log(s) - the new log(s)
   * @param {bool} append - just push on last position and truncate if needed
   * @return {array} logs in memory
   */
  logs(newLogs, append) {
    if (arguments.length) {
      if (append) {
        this.logsLoaded.push(newLogs);
        if (this.logsLoaded.length > this.maxLogs) {
          this.logsLoaded = this.logsLoaded.slice(-this.maxLogs);
        }
      } else {
        this.logsLoaded = newLogs;
      }

      // Count by severity
      // We count each time because of the slice
      // It is not possible to to just increment
      this.fatals = 0;
      this.errors = 0;
      this.warnings = 0;
      this.infos = 0;
      const logs = this.logsLoaded;
      for (let i = 0; i < logs.length; i++) {
        switch(logs[i].severity) {
          case 'F':
            this.fatals++;
            break;
          case 'E':
            this.errors++;
            break;
          case 'W':
            this.warnings++;
            break;
          case 'I':
            this.infos++;
            break;
        }
      }

      this.notify();
    }

    return this.logsLoaded;
  }

  /**
   * Getter/setter for the inspector
   * @param {bool} activated - state of the inspector
   * @return {bool} if the inspector is enabled or not
   */
  inspector(activated) {
    if (arguments.length) {
      this.inspectorActivated = activated;
      this.notify();
    }

    return this.inspectorActivated;
  }

  /**
   * Getter/setter for the auto-scroll
   * @param {bool} enabled - state of auto-scroll
   * @return {bool} if the auto-scroll is enabled or not
   */
  autoScroll(enabled) {
    if (arguments.length) {
      this.autoScrollEnabled = enabled;
      this.notify();
    }

    return this.autoScrollEnabled;
  }

  /**
   * Getter/setter for the max number of logs loaded in memory
   * @param {Number} max - how many logs
   * @return {Number} how many logs
   */
  max(max) {
    if (arguments.length) {
      this.maxLogs = max;
      this.notify();
    }

    return this.maxLogs;
  }
}
