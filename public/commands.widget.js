jQuery.widget('o2.commands', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('commands widget needs a model');
    }

    this.model = this.options.model;
    this.el = this.element[0]; // get DOM element from widget
    this.render();
    this.model.observe(this.render.bind(this)); // refresh when data change
  },

  render: function() {
    const model = this.model;

    const template = `<div id="commands">
  <div class="pull-left command-bar toolbar">
    <button class="btn toolbar-btn" onclick="location.href='/'" title="Restart this application (r)">Refresh page</button>
    <button class="btn toolbar-btn" onclick="app.empty()" title="Empty all logs (e)">Empty</button>
    <span class="toolbar-spacer"></span>

    <button class="btn toolbar-btn ${model.max() === 1000 ? 'active' : ''}" onclick="app.max(1000)" title="Keep only 1k logs">1k</button>
    <button class="btn toolbar-btn ${model.max() === 10000 ? 'active' : ''}" onclick="app.max(10000)" title="Keep only 10k logs">10k</button>
    <button class="btn toolbar-btn ${model.max() === 100000 ? 'active' : ''}" onclick="app.max(100000)" title="Keep only 100k logs">100k</button>
    <span class="toolbar-spacer"></span>

    <button class="btn toolbar-btn ${model.querying ? 'disabled' : ''}" onclick="app.query()" title="Find X first logs based on filters (q)" ${model.querying ? 'disabled' : ''}>${model.querying ? 'Loading...' : 'Query'}</button>
    <span class="toolbar-spacer"></span>

    <span class="toolbar">
      <button class="btn toolbar-btn ${model.live() ? 'active' : ''}" onclick="app.live(!app.live())" title="Start/stop live mode with filters (l)">Live</button>
      <div class="toolbar toolbar-live-options ${model.live() ? 'open' : ''}">
        <span class="toolbar-live-arrow"> ➡ </span>︎
        <button class="btn toolbar-btn ${model.autoScroll() ? 'active' : ''}" onclick="app.autoScroll(!app.autoScroll())" title="Scroll at bottom each time a message is received (s)">Auto-scroll</button>
        <button class="btn toolbar-btn ${model.autoClean() ? 'active' : ''}" onclick="app.autoClean(!app.autoClean())" title="Keep only the last X logs (c)">Auto-clean</button>
      </div>
    </span>
  </div>

  <div class="pull-right command-bar toolbar">
    <button title="Shortcut: i" class="btn toolbar-btn ${model.inspector() ? 'active' : ''}" onclick="app.inspector(!app.inspector())">Inspector</button>
  </div>
</div>`;

    morphdom(this.el, template);
  }
});
