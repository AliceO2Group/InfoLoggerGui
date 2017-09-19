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
const appConfig = {
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
<script src="/observable.class.js"></script>
<script src="/app.class.js"></script>
<script src="/logs.widget.js"></script>
<script src="/commands.widget.js"></script>
<script src="/filters.widget.js"></script>
<script src="/statusBar.widget.js"></script>
<script src="/utils.js"></script>
<script src="/morphdom.plugin.js"></script>

<script type="text/javascript">
// Global error handler
$(document).ajaxError(function(err, xhr) {
  alert('Error with ajax: ' + xhr.statusText);
  console.error(err, xhr.statusText);
});

// Starting app
$(function() {
  /// instance of websocket widget
  const ws = $.o2.websocket({
    // pass url of websocket server
    url: `wss://${appConfig.hostname}:${appConfig.port}`,
    // token, cernid, name and username are provided by CERN SSO
    token: appConfig.token,
    id: appConfig.personid,
  }, $('#ws') );

  // Model runs by itself and has an interface Observable
  // so views can connect to him and rereder when they get notified by the model

  const app = new ModelApp();

  $('#logs').logs({model: app});
  $('#filters').filters({model: app});
  $('#commands').commands({model: app});
  $('#statusBar').statusBar({model: app});

  // Server should stop by itself the real-time when a client shutdown
  // but currently there is no way to know if a client has been disconnected
  // So we tell the server to not live when we begin a new session
  app.liveStop();

  // Let's get the last data to begin
  app.query();

  // Expose app instance for debugging purpose as it contains all the project's data
  window.app = app;
});
</script>
