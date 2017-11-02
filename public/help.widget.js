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
    morphdom(this.el,
      this.model.help()
      ? `<div id="help" class="modal modal-help">
          <button type="button" class="modal-close" onclick="app.help(false)">×</button>
          <div class="modal-content">
            ${this.model.helpHTML()}
          </div>
        </div>`
      : `<div id="help"></div>`
    );
  }
});
