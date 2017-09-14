<!doctype html>
<title>InfoLoggerGui - Alice</title>
<link rel="stylesheet" href="/jquery-ui/jquery-ui.css">
<link rel="stylesheet" href="/app.css">

<div class="panel-command">
  <div id="filters"></div>
  <div id="commands"></div>
</div>

<div class="panel-logs">
  <div id="logs"></div>
</div>

<div id="statusBar"></div>

<div id="ws"></div>


<script>
var appConfig = {
  token: "{{token}}",
  hostname: "{{hostname}}",
  port: "{{port}}",
  personid: "{{personid}}",
};
</script>

<!-- Gui Framework -->
<script src="/jquery/jquery.js"></script>
<script src="/jquery-ui/jquery-ui.js"></script>
<script src="ws.widget.js"></script>

<!-- This project -->
<script src="/query.model.js"></script>
<script src="/stream.model.js"></script>
<script src="/logs.widget.js"></script>
<script src="/commands.widget.js"></script>
<script src="/filters.widget.js"></script>
<script src="/statusBar.widget.js"></script>

<script type="text/javascript">
// utils

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

// Global error handler
$(document).ajaxError(function(err, xhr) {
  alert('Error with ajax: ' + xhr.statusText);
  console.error(err, xhr.statusText);
});

  $(function() {
    /// instance of websocket widget
    var ws = $.o2.websocket({
      // pass url of websocket server
      url: `wss://${appConfig.hostname}:${appConfig.port}`,
      // token, cernid, name and username are provided by CERN SSO
      token: appConfig.token,
      id: appConfig.personid,
    }, $('#ws') );

    // Model runs by itself and has an interface Observable
    // so views can connect to him and rereder when they get notified by the model

    // Simple Observable class to notify others listening for changes
    class Observable {
      observe(callback) {
        if (!this.observers) {
          this.observers = [];
        }

        this.observers.push(callback);
      }

      unobserve(callback) {
        this.observers = this.observers.filter(observer => {
          return observer !== callback
        });
      }

      notify() {
        this.observers.forEach(observer => {
          observer(this);
        });
      }
    }

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

    app = new ModelApp();

    $('#logs').logs({model: app});
    $('#filters').filters({model: app});
    $('#commands').commands({model: app});
    $('#statusBar').statusBar({model: app});

    // Server should stop by itself the real-time when a client shutdown
    // but currently there is no way to know if a client has been disconnected
    // So we tell the server to not live when we begin a new session
    app.liveStop();
  });
</script>
