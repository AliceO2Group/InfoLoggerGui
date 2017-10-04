<!doctype html>
<title>InfoLoggerGui - Alice</title>
<link rel="icon" href="/favicon.png" />
<link rel="stylesheet" href="/jquery-ui/jquery-ui.css">
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

<div id="ws"></div>


<script>
const appConfig = {
  token: "{{token}}",
  hostname: "{{hostname}}",
  port: "{{port}}",
  personid: "{{personid}}",
  oauth: "{{oauth}}",
};
</script>

<!-- Gui Framework -->
<script src="/jquery/jquery.js"></script>
<script src="/jquery-ui/jquery-ui.js"></script>
<script src="ws.widget.js"></script>

<!-- This project -->
<script src="/observable.class.js"></script>
<script src="/app.class.js"></script>
<script src="/body.widget.js"></script>
<script src="/logs.widget.js"></script>
<script src="/commands.widget.js"></script>
<script src="/filters.widget.js"></script>
<script src="/statusBar.widget.js"></script>
<script src="/inspector.widget.js"></script>
<script src="/utils.js"></script>
<script src="/libs/morphdom-umd.min.js"></script>

<script type="text/javascript">
// Global error handler
$(document).ajaxError(function(err, xhr) {
  // Error with a message
  if (xhr.responseJSON && xhr.responseJSON.message) {
    return alert(xhr.responseJSON.message);
  }

  // Unknown error, just print the HTTP status
  alert(xhr.statusText);

  // Log for dev
  console.error('Ajax error:', xhr);
});

// Starting app
$(function() {
  /// instance of websocket widget
  const ws = $.o2.websocket({
    // pass url of websocket server
    url: `wss://${location.host}`,
    // token, cernid, name and username are provided by CERN SSO
    oauth: appConfig.oauth,
    token: appConfig.token,
    id: appConfig.personid,
  }, $('#ws') );

  // Model runs by itself and has an interface Observable
  // so views can connect to him and rereder when they get notified by the model

  const app = new App(ws);

  $('body').body({model: app});
  $('#logs').logs({model: app});
  $('#filters').filters({model: app});
  $('#commands').commands({model: app});
  $('#inspector').inspector({model: app});
  $('#statusBar').statusBar({model: app});

  // Expose app instance for debugging purpose as it contains all the project's data
  window.app = app;
});
</script>
