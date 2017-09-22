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
    this.columns = { // display or not
      severity: true,
      level: false,
      timestamp: true,
      hostname: true,
      rolename: true,
      pid: false,
      username: false,
      system: false,
      facility: true,
      detector: false,
      partition: false,
      run: false,
      errcode: false,
      errline: false,
      errsource: false,
      message: true
    };

    this.filters = {
      match: {
        severity: '',
        level: '',
        timestamp: '',
        hostname: '',
        rolename: '',
        pid: '',
        username: '',
        system: '',
        facility: '',
        detector: '',
        partition: '',
        run: '',
        errcode: '',
        errline: '',
        errsource: '',
        message: ''
      },
      exclude: {
        severity: '',
        level: '',
        timestamp: '',
        hostname: '',
        rolename: '',
        pid: '',
        username: '',
        system: '',
        facility: '',
        detector: '',
        partition: '',
        run: '',
        errcode: '',
        errline: '',
        errsource: '',
        message: ''
      }
    };

    $('#ws').bind('websocketmessage', (evt, data) => {
      this.onLiveMessage(data.payload);
    });
  }

  /**
   * Query server for logs stored in DB
   * @param {string} from - date limit
   * @param {string} to - date limit
   * @param {int} limit - how many rows to get
   * @return {xhr} jquery ajax instance
   */
  query(from, to, limit) {
    // first, stop real-time if set
    if (this.liveStarted) {
      this.liveStop();
    }

    // jquery does not know how to stringify a deep object, so we JSON.stringify
    // and we need to set content-type too (form-www-encoded by default)
    return $.ajax({
      url: '/api/query?token=' + appConfig.token,
      method: 'POST',
      data: JSON.stringify({filters: this.filters, from, to, limit}),
      contentType: 'application/json',
      success: (rows) => {
        // Logs don't have any unique id, so we generate one
        rows.forEach((row) => row.virtualId = $.virtualId());

        this.logs = rows;
        this.notify();
      }
    });
  }

  /**
   * Ask server to send all new logs via websocket
   * @return {xhr} jquery ajax instance
   */
  liveStart() {
    // first, empty all logs, then listen for new ones
    this.logs = [];
    this.notify();

    return $.ajax({
      url: '/api/liveStart?token=' + appConfig.token,
      method: 'POST',
      data: JSON.stringify({filters: this.filters}),
      contentType: 'application/json',
      success: () => {
        this.liveStarted = true;
        this.notify();
      }
    });
  }

  /**
   * Inserts log into list and notify observers
   * @param {string} log - log object to be inserted
   */
  onLiveMessage(log) {
    // Logs don't have any unique id, so we generate one
    log.virtualId = $.virtualId();

    this.logs.push(log);
    this.notify();
  }

  /**
   * Tell server to stop sending new logs into websocket
   * @return {xhr} jquery ajax instance
   */
  liveStop() {
    return $.post('/api/liveStop?token=' + appConfig.token, () => {
      this.liveStarted = false;
      this.notify();
    });
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
   * Set search per field (operand: =)
   * @param {string} fieldName - field to be set
   * @param {string} value - criterias, separated by space
   */
  matchField(fieldName, value) {
    this.filters.match[fieldName] = value;
    this.notify();
  }

  /**
   * Set search per field (operand: !=)
   * @param {string} fieldName - field to be set
   * @param {string} value - criterias, separated by space
   */
  excludeField(fieldName, value) {
    this.filters.exclude[fieldName] = value;
    this.notify();
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
}
