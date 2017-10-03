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

    const template = `<div id="statusBar">
      ${model.logs.length} messages ${model.total !== model.logs.length ? `out of ${model.total}` : ''} ${model.queyTime === 0 ? '' : `(${(model.queyTime / 1000).toPrecision(2)} seconds)`}
    </div>`;

    morphdom(this.el, template);
  }
});
