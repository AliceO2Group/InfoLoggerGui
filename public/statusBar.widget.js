jQuery.widget('o2.statusBar', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('statusBar widget needs a model');
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
    const model = this.model;

    const template = `<div id="statusBar" class="default-cursor">
      ${model.logs().length} messages
      ${model.total !== model.logs().length ? `out of ${model.total}` : ''}
      ${model.queyTime === 0 ? '' : `(${(model.queyTime / 1000).toPrecision(2)} seconds)`}

      ${model.infos ? `<span class="severity-i">${model.infos} I</span>` : ''}
      ${model.warnings ? `<span class="severity-w">${model.warnings} W</span>` : ''}
      ${model.errors ? `<span class="severity-e">${model.errors} E</span>` : ''}
      ${model.fatals ? `<span class="severity-f">${model.fatals} F</span>` : ''}

      <div class="pull-right" title="State of the connection between this app and the web server">
        ${model.wsState === 'open' ? '<span class="text-sucess">READY</span>' : ''}
        ${model.wsState === 'connecting' ? '<span class="text-warning">CONNECTING</span>' : ''}
        ${model.wsState === 'authentication' ? '<span class="text-warning">AUTHENTICATION</span>' : ''}
        ${model.wsState === 'close' ? '<span class="text-error">DISCONNECTED</span>' : ''}
        <span> • </span>
        <a title="Get some help on how to use this app (h)" class="" href="javascript:;" onclick="app.help(true)">Help</a>
      </div>
    </div>`;

    morphdom(this.el, template);
  }
});
