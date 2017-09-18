jQuery.widget('o2.commands', {
  _create: function() {
    console.log('commands widget created');

    if (!this.options.model) {
      throw new Error('commands widget needs a model');
    }

    this.model = this.options.model;
    this.model.observe(this.render.bind(this)); // refresh when data change
    this.render();
  },

  render: function() {
    const el = this.element;
    const model = this.model;
    var str = '';

    str = '<button onclick="location.href=\'/\'" class="btn">Refresh page</button>';

    if (model.liveStarted) {
      str += '<button class="btn" onclick="app.liveStop()">Live stop</button>';
    } else {
      str += '<button class="btn" onclick="app.liveStart()">Live start</button>';
    }

    str += '<button class="btn" onclick="app.query()">Query last 50 msg</button>';

    // virtual-dom should be used here to avoid losing text selection and scroll position
    $(el).html(str);
  }
});
