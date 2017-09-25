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
    <button class="btn toolbar-btn" onclick="location.href='/'">Refresh page</button>
    <button class="btn toolbar-btn" onclick="app.clear()">Clear</button>
    <span class="toolbar-spacer"></span>

    <button class="btn toolbar-btn ${model.max() === 1000 ? 'active' : ''}" onclick="app.max(1000)">1k</button>
    <button class="btn toolbar-btn ${model.max() === 10000 ? 'active' : ''}" onclick="app.max(10000)">10k</button>
    <button class="btn toolbar-btn ${model.max() === 100000 ? 'active' : ''}" onclick="app.max(100000)">100k</button>
    <span class="toolbar-spacer"></span>

    <button class="btn toolbar-btn ${model.querying ? 'disabled' : ''}" onclick="app.query()" title="First X logs, shortcut: q" ${model.querying ? 'disabled' : ''}>${model.querying ? 'Loading...' : 'Query'}</button>
    <span class="toolbar-spacer"></span>

    <span class="toolbar">
      <button class="btn toolbar-btn ${model.live() ? 'active' : ''}" onclick="app.live(!app.live())">Live</button>
      <div class="toolbar toolbar-live-options ${model.live() ? 'open' : ''}">
        <span class="toolbar-live-arrow"> ➡ </span>︎
        <button class="btn toolbar-btn ${model.autoScroll() ? 'active' : ''}" onclick="app.autoScroll(!app.autoScroll())">Auto-scroll</button>
        <button class="btn toolbar-btn ${model.autoClean() ? 'active' : ''}" onclick="app.autoClean(!app.autoClean())">Auto-clean</button>
      </div>
    </span>
  </div>

  <div class="pull-right command-bar">
    <button title="Shortcut: i" class="btn ${model.inspector() ? 'active' : ''}" onclick="app.inspector(!app.inspector())">Inspector</button>
  </div>
</div>`;

    morphdom(this.el, template);
  }
});
