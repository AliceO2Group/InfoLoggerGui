jQuery.widget('o2.statusBar', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('statusBar widget needs a model');
    }

    this.model = this.options.model;
    this.model.observe(this.render.bind(this)); // refresh when data change
    this.el = this.element[0]; // get DOM element from widget
    this.render();
  },

  render: function() {
    const model = this.model;

    // Count by severity
    let fatals = 0;
    let errors = 0;
    let warnings = 0;
    let infos = 0;
    for (let i = 0; i < model.logs.length; i++) {
      switch(model.logs[i].severity) {
        case 'F':
          fatals++;
          break;
        case 'E':
          errors++;
          break;
        case 'W':
          warnings++;
          break;
        case 'I':
          infos++;
          break;
      }
    }

    const template = `<div id="statusBar" class="default-cursor">
      ${model.logs.length} messages
      ${model.total !== model.logs.length ? `out of ${model.total}` : ''}
      ${model.queyTime === 0 ? '' : `(${(model.queyTime / 1000).toPrecision(2)} seconds)`}

      ${infos ? `<span class="severity-i">${infos} I</span>` : ''}
      ${warnings ? `<span class="severity-w">${warnings} W</span>` : ''}
      ${errors ? `<span class="severity-e">${errors} E</span>` : ''}
      ${fatals ? `<span class="severity-f">${fatals} F</span>` : ''}

      <div class="pull-right" title="State of the connection between this app and the web server">${model.wsState === 'open' ? '<span class="text-sucess">READY</span>' : '<span class="text-error">DISCONNECTED</span>'}</div>
    </div>`;

    morphdom(this.el, template);
  }
});
