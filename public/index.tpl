<!doctype html>
<title>InfoLoggerGui - Alice</title>
<link rel="icon" href="/favicon.png" />
<link rel="stylesheet" href="/libs/jquery-ui.css">
<link rel="stylesheet" href="/app.css">

<div class="panel-command">
  <div id="filters"></div>
  <div id="commands"></div>
</div>

<div class="panel-logs">
  <div id="inspector"></div>
  <div id="logs"></div>
</div>

<div id="statusBar"></div>
<div id="help"></div>

<div id="ws"></div>


<script>
const appConfig = {
  token: "{{token}}",
  hostname: "{{hostname}}",
  port: "{{port}}",
  personid: "{{personid}}",
  oauth: "{{oauth}}",
  helpMarkdown: `{{{helpMarkdown}}}`,
};
</script>

<!-- External libs from 'npm run postinstall' -->
<script src="/libs/morphdom-umd.min.js"></script>
<script src="/libs/moment.js"></script>
<script src="/libs/moment-timezone-with-data.js"></script>

<!-- Gui Framework -->
<script src="/libs/jquery.js"></script>
<script src="/libs/jquery-ui.js"></script>
<script src="websocket-client.js"></script>

<!-- This project -->
<script src="/observable.class.js"></script>
<script src="/app.class.js"></script>
<script src="/minimap.widget.js"></script>
<script src="/body.widget.js"></script>
<script src="/logs.widget.js"></script>
<script src="/commands.widget.js"></script>
<script src="/filters.widget.js"></script>
<script src="/statusBar.widget.js"></script>
<script src="/inspector.widget.js"></script>
<script src="/help.widget.js"></script>
<script src="/utils.js"></script>

<script type="text/javascript">
// Global error handler
$(document).ajaxError(function(err, xhr) {
  // Error with a message
  if (xhr.responseJSON && xhr.responseJSON.message) {
    return alert(xhr.responseJSON.message);
  }

  // It's ok if user aborted himself
  if (xhr.statusText === 'abort') {
    return;
  }

  // Unknown error, just print the HTTP status
  alert(xhr.statusText);

  // Log for dev
  console.error('Ajax error:', xhr);
});

// Global timezone of user
const LOCAL_TIMEZONE = moment.tz.guess();

// Starting app
$(function() {
  // instance of websocket widget
  const ws = new WebSocketClient(
    appConfig.personid,
    appConfig.token,
    appConfig.oauth
  );

  window.ws = ws;

  // Model runs by itself and has an interface Observable
  // so views can connect to him and rereder when they get notified by the model

  const app = new App(ws);

  $('body').body({model: app});
  $('#logs').logs({model: app});
  $('#filters').filters({model: app});
  $('#commands').commands({model: app});
  $('#inspector').inspector({model: app});
  $('#statusBar').statusBar({model: app});
  $('#help').help({model: app});

  // Expose app instance for debugging purpose as it contains all the project's data
  window.app = app;
});
</script>
