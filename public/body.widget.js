// This widget is mainly about global events like keyboard keys.

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
    console.log(`e.keyCode=${e.keyCode}, e.metaKey=${e.metaKey}, e.ctrlKey=${e.ctrlKey}, e.altKey=${e.altKey}`);

    // Disable ctrl+f
    if (e.keyCode === 70 && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); // CTRL+F is not usable in this app
      e.stopPropagation();
      document.querySelector('.focus-on-ctrl-f').focus(); // focus on filters (datetime)
      return;
    }

    // don't listen to keys when it comes from an input (they transform into letters)
    // except spacial ones which are not chars
    // http://www.foreui.com/articles/Key_Code_Table.htm
    if (e.target.tagName.toLowerCase() === 'input' && e.keyCode > 47) {
      return;
    }

    // shortcuts
    switch (e.keyCode) {
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
      case 77: // m
        this.model.minimap(!this.model.minimap());
        break;

      case 81: // q
        this.model.query(true); // start/restart ajax
        break;
      case 13: // ENTER
        this.model.query(true); // start/restart ajax
        break;
      case 27: // ESC
        if (this.model.query()) {
          this.model.query(false); // just stop current ajax
        }
        break;
    }
  }
});
