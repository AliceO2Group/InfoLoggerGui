jQuery.widget('o2.help', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('help widget needs a model');
    }

    this.model = this.options.model;
    this.model.observe((e) => {
      if (this.requestFrame) {
        cancelAnimationFrame(this.requestFrame);
      }
      this.requestFrame = requestAnimationFrame(this.render.bind(this)); // refresh when data change
    });
    this.el = this.element[0]; // get DOM element from widget
    this.render();
  },

  render: function() {
    const template = `<div id="help" class="modal modal-help">
      <button type="button" class="modal-close" onclick="app.help(false)">×</button>
      <div class="modal-content">
        <h1>Help and tips for InfoLoggerGui</h1>

        <h3>General</h3>
        <p>The main functions are query and live mode.
          To avoid slow loading and jerky rendering only X logs are in memory at any time, which you can set on the command bar (top) and see how many logs are loaded in the status bar (bottom).
          Many functions are binded to hotkeys as shortcut to allow you to be quick, just put the mouse on top of it to know them.</p>
        <p>Bug? Improvement? <a href="mailto:vladimir.kosmala@cern.ch">vladimir.kosmala@cern.ch</a></p>

        <h3>Filters</h3>
        <p>Filters are applied for each new query and each new live session.
          Timestamps are parsed to help you type quickly absolute and relative datetimes.
          Other fields are exact match of words, each space will be handled as a "OR" operator.
          By clicking on filters, you can enable or disable the columns on the logs'table.
          You can share all logs you have loaded via filters by copying the link in the address bar, filters are included in the URL so the view will be the same for the person cliking on your link.
          </p>

        <h3>Commands</h3>
        <p>You can choose the maximum logs in memory (1k to 100k), it's always good to put 1k to load quickly and filter for what you are looking for.
          Then you can empty ("e" on your keyboard) the logs on each new run when live mode is used.
          The arrows lookup for errors and are binded to your keyboard for quick access.
          </p>

        <h3>Inspector</h3>
        <p>The inspector is the best way to see every field from a log and have more information on it thanks to the link to the wiki error code.
          You can also copy the entire log selected to share it by email.
          </p>

        <h3>Status</h3>
        <p>On the left side is the number of logs loaded in memory that you can scroll to and also the number of logs really existing in the database or appended from live mode.
          On the right side is the real-time connection to the server providing this app, if it's disconnected it means the network or server are dead.
          </p>
      </div>
    </div>`;

    morphdom(this.el, this.model.help() ? template : '<div id="help"></div>');
  }
});
