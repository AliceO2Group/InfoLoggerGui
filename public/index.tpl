<link rel="stylesheet" href="/jquery-ui/jquery-ui.css">
<link rel="stylesheet" href="/app.css">

<div class="panel-command">
  <h4>Alice infoLoggerGui</h4>
  <a href="/" class="ui-button ui-widget ui-corner-all">Refresh page</a>
</div>

<div class="panel-logs">
  <div class="table-fixed">
    <div class="table-fixed-container">
      <table id="logs">
        <thead>
          <tr>
            <th class="col-100px">
              <div>Severity</div>
            </th>
            <th class="col-100px">
              <div>Host</div>
            </th>
            <th class="col-max">
              <div>Message</div>
            </th>
          </tr>
        </thead>
        <tbody>

        </tbody>
      </table>
    </div>
  </div>
</div>

<div id="ws"></div>


<script>
var token = "{{token}}";
</script>

<!-- Gui Framework -->
<script src="/jquery/jquery.js"></script>
<script src="/jquery-ui/jquery-ui.js"></script>
<script src="ws.widget.js"></script>

<!-- This project -->
<script src="/query.model.js"></script>
<script src="/stream.model.js"></script>
<script src="/logs.widget.js"></script>

<script type="text/javascript">
// utils
function htmlEscape(str) {
  return str.replace(/&/g, '&amp;') // first!
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/`/g, '&#96;');
}
  $(function() {
    /// instance of websocket widget
    var ws = $.o2.websocket({
      // pass url of websocket server
      url: 'wss://vcap.me:8443',
      // token, cernid, name and username are provided by CERN SSO
      token: '{{token}}',
      id: {{personid}},
    }, $('#ws') );

    $('#ws').bind('websocketmessage', function(evt, data) {
      console.log(arguments);
    });

    // Model runs by itself and has an interface Observable
    // so views can connect to him and rereder when they get notified by the model

    const model = {
      filters: {
        severity: null,
        level: null,
        timestamp: null,
        hostname: null,
        rolename: null,
        pid: null,
        username: null,
        system: null,
        facility: null,
        detector: null,
        partition: null,
        run: null,
        errcode: null,
        errline: null,
        errsource: null,
        message: null,
      },
      logs: [
        {"severity":"I","level":null,"timestamp":"1505223463.828289","hostname":"aido2db","rolename":"","pid":124889,"username":"root","system":"","facility":"","detector":"","partition":"","run":null,"errcode":null,"errline":null,"errsource":"","message":"test Tue Sep 12 15:37:43 CEST 201"},
        {"severity":"I","level":null,"timestamp":"1505223463.828289","hostname":"aido2db","rolename":"","pid":124889,"username":"root","system":"","facility":"","detector":"","partition":"","run":null,"errcode":null,"errline":null,"errsource":"","message":"test Tue Sep 12 15:37:43 CEST 201"}
      ],
      filteredLogs: () => {
        return this.logs.filter();
      },
      // Observable
      set: (obj, value) => {
        $.extend(this, obj);
        // trigger listeners
      }
    };

    $('#logs').logs({model: model});
  });
</script>
