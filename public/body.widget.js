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
    console.log('e.keyCode:', e.keyCode, e);
    // shortcuts
    switch (e.keyCode) {
      case 13: // bottom
        this.model.query();
        break;
      case 40: // bottom
        this.model.moveSelected(+1);
        e.preventDefault();
        break;
      case 38: // top
        this.model.moveSelected(-1);
        e.preventDefault();
        break;
      case 73: // i
        this.model.inspector(!this.model.inspector());
        break;
      case 76: // l
        this.model.live(!this.model.live());
        break;
      case 69: // e
        this.model.empty();
        break;
      case 82: // r
        location.href = '/';
        break;
      case 81: // q
        this.model.query();
        break;
      case 83: // s
        this.model.autoScroll(!this.model.autoScroll());
        break;
      case 72: // h
        this.model.help(!this.model.help());
        break;
      case 37: // left
        this.model.moveSelectedError(e.altKey ? -Infinity : -1);
        break;
      case 39: // right
        this.model.moveSelectedError(e.altKey ? +Infinity : +1);
        break;
    }
  }
});
