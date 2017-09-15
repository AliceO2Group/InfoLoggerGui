// Set mode and get logs
class ModelApp extends Observable {
  constructor() {
    super();

    this.logs = []; // to be shown
    this.liveStarted = false; // websocket gets new data
    this.columns = { // display or not
      severity: true,
      level: false,
      timestamp: true,
      hostname: true,
      rolename: false,
      pid: false,
      username: false,
      system: false,
      facility: false,
      detector: false,
      partition: false,
      run: false,
      errcode: false,
      errline: false,
      errsource: false,
      message: true,
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
        message: '',
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
        message: '',
      }
    };

    $('#ws').bind('websocketmessage', (evt, data) => {
      this.onLiveMessage(data.payload);
    });
  }

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
      data: JSON.stringify({filters: this.filters}),
      contentType: 'application/json',
      success: rows => {
        this.logs = rows;
        this.notify();
      }
    });
  }

  liveStart() {
    // first, empty all logs, then listen for new ones
    this.logs = [];
    this.notify();

    return $.ajax({
      url: '/api/liveStart?token=' + appConfig.token,
      method: 'POST',
      data: JSON.stringify({filters: this.filters}),
      contentType: 'application/json',
      success: rows => {
        this.liveStarted = true;
        this.notify();
      }
    });
  }

  onLiveMessage(message) {
    console.log('message:', message);
    this.logs.push(message);
    this.notify();
  }

  liveStop() {
    return $.post('/api/liveStop?token=' + appConfig.token, rows => {
      this.liveStarted = false;
      this.notify();
    });
  }

  displayField(fieldName, value) {
    this.columns[fieldName] = value;
    this.notify();
  }

  matchField(fieldName, value) {
    this.filters.match[fieldName] = value;
    this.notify();
  }

  excludeField(fieldName, value) {
    this.filters.exclude[fieldName] = value;
    this.notify();
  }
}
