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
  <div class="pull-left command-bar">
    <button onclick="location.href='/'" class="btn">Refresh page</button>
    ${model.liveStarted
      ? '<button class="btn" onclick="app.liveStop()">Live stop</button>'
      : '<button class="btn" onclick="app.liveStart()">Live start</button>'
    }
    <button class="btn" onclick="app.query()">Query last 1000 msg</button>
  </div>

  <div class="pull-right command-bar">
    <button title="Shortcut: i" class="btn ${model.inspector() ? 'active' : ''}" onclick="app.inspector(!app.inspector())">Inspector</button>
  </div>
</div>`;

    morphdom(this.el, template);
  }
});
