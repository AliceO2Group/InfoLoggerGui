/* globals Observable,appConfig */

/**
 * App model containing all data, methods, ajax calls of this application
 * It runs on its own and views can 'observe' for changes to redraw.
 */
class ModelApp extends Observable {
  /**
   * Constructor, declares default properties and init Observable super class
   */
  constructor() {
    super();

    this.logs = []; // to be shown
    this.liveStarted = false; // websocket gets new data
    this.inspectorActivated = true; // right panel displaying current row selected
    this.selectedRow = null;
    this.autoScrollEnabled = true;
    this.maxLogs = 10000;
    this.queyTime = 0;
    this.querying = false; // loading data from a query
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

    $('#ws').bind('websocketmessage', (evt, data) => {
      this.onLiveMessage(data.payload);
    });
  }

  /**
   * Query server for logs stored in DB
   * @return {xhr} jquery ajax instance
   */
  query() {
    console.log('this:', this);
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
      data: JSON.stringify({limit: this.maxLogs}), // filters: this.filters, TODO: filtering with broadcast
      contentType: 'application/json',
      success: (rows) => {
        // Logs don't have any unique id, so we generate one
        rows.forEach((row) => row.virtualId = $.virtualId());

        this.queyTime = new Date() - startTiming;
        this.logs = rows;
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

    if (enabled) {
      // first, empty all logs, then listen for new ones
      this.logs = [];
      this.notify();

      $.ajax({
        url: '/api/liveStart?token=' + appConfig.token,
        method: 'POST',
        data: JSON.stringify({filters: this.filters}),
        contentType: 'application/json',
        success: () => {
          this.liveStarted = true;
          this.queyTime = 0; // no querytime with real-time
          this.notify();
        }
      });
    } else {
      $.post('/api/liveStop?token=' + appConfig.token, () => {
        this.liveStarted = false;
        this.queyTime = 0; // no querytime with real-time
        this.notify();
      });
    }

    return this.liveStarted;
  }

  /**
   * Inserts log into list and notify observers
   * @param {string} log - log object to be inserted
   */
  onLiveMessage(log) {
    // Logs don't have any unique id, so we generate one
    log.virtualId = $.virtualId();

    this.logs.push(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    this.notify();
  }

  /**
   * Empty all logs stored
   */
  empty() {
    this.logs = [];
    this.queyTime = 0;
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
   * Getter/setter for criterias per field and per operator
   * @param {string} fieldName - field to be set
   * @param {string} operator - operator associated (match, exclude, lessthan, morethan)
   * @param {string} value - criteria
   */
  criteria(fieldName, operator, value) {
    if (arguments.length === 3) {
      // this.filters[operator][fieldName] = value;
      // console.log(arguments);
      // this.notify();

      switch(operator) {
        case 'match':
          this.filters[fieldName] = value;
          break;
        case 'exclude':
          if (this.filters[fieldName] !== 'object') {
            this.filters[fieldName] = {};
          }
          this.filters[fieldName] = {$not: {$eq: value, $not: null}};
          break;
        case 'lessthan':
          if (this.filters[fieldName] !== 'object') {
            this.filters[fieldName] = {};
          }
          this.filters[fieldName] = {$lt: value};
          break;
        case 'morethan':
          if (this.filters[fieldName] !== 'object') {
            this.filters[fieldName] = {};
          }
          this.filters[fieldName] = {$gt: value};
          break;
        default:
          throw new Error(`operator "${operator}" unknown`);
          break;
      }

      console.log('this.filters:', this.filters);
    }
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
      if (!value) {
        // empty value, don't keep useless information
        delete this.rawFilters[field][operator];

        // remove also the fields widthout any value
        if (Object.keys(this.rawFilters[field]).length === 0) {
          delete this.rawFilters[field];
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
      console.log('this.rawFilters:', this.rawFilters, this.filters);
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
        row = this.logs.find((log) => log.virtualId === row)
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
    if (!this.logs.length) {
      return;
    }

    const currentSelected = this.selected();
    if (!currentSelected) {
      this.selected(this.logs[0]);
      return;
    }

    const currentIndex = this.logs.indexOf(currentSelected);
    const newIndex = Math.min(Math.max(currentIndex + n, 0), this.logs.length - 1); // [0 ; length-1]

    this.selected(this.logs[newIndex].virtualId);
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
