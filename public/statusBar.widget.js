jQuery.widget('o2.statusBar', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('statusBar widget needs a model');
    }

    this.model = this.options.model;
    this.model.observe(this.render.bind(this)); // refresh when data change
    this.render();
  },

  render: function() {
    const el = this.element;
    const model = this.model;
    let str = '';

    str = `
        ${model.logs.length} messages
    `;

    // virtual-dom should be used here to avoid losing text selection and scroll position
    $(el).html(str);
  }
});
