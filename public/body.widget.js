jQuery.widget('o2.body', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('body widget needs a model');
    }

    this.model = this.options.model;
    this.el = this.element[0]; // get DOM element from widget

    this.el.addEventListener('keydown', this.onKeydown.bind(this));
  },

  onKeydown: function(e) {
    // don't handle input events
    if (e.target.tagName.toLowerCase() === 'input') {
      return;
    }

    // shortcuts
    switch (e.keyCode) {
      case 40: // bottom
        this.model.moveRow(+1);
        e.preventDefault();
        break;
      case 38: // top
        this.model.moveRow(-1);
        e.preventDefault();
        break;
      case 105: // i
        this.model.inspector(!this.model.inspector());
        break;
    }
  }
});
