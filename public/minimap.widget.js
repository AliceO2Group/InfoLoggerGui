/* eslint max-len: 0 */
/* templates are better read with full length */
/* eslint indent: 0 */
/* templates are not well recognized by eslint, js into tpl is not well handled */

jQuery.widget('o2.minimap', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('minimap widget needs a model');
    }

    this.model = this.options.model;
    this.model.observe(this.render.bind(this)); // refresh when data change
    this.el = this.element[0]; // get DOM element from widget
    this.canvas = null;
    this.ctx = null;
    this.render();

    this.canvas.addEventListener('click', (e) => {
      const offsetTop = $(this.canvas).offset().top;
      const eventTop = e.pageY;
      const clickPositionY = eventTop - offsetTop;
      const logsLength = this.model.logs().length;
      const rowNumber = logsLength <= this.canvas.height ? clickPositionY : Math.round(clickPositionY / this.canvas.height * logsLength);
      this.model.selected(rowNumber);
    });
  },

  _destroy: function() {

  },

  render: function() {
    const model = this.model;

    const template = `<div id="minimap"><canvas width="50" height="729"></canvas></div>`;
    morphdom(this.el, template);

    if (!this.ctx) {
      this.canvas = this.el.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
    }

    const ctx = this.ctx;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 50, 99729);
    const logs = model.logs();
    ctx.scale(1, Math.min(this.canvas.height / logs.length, 1));
    for (var i = 0; i < logs.length; i++) {
      switch(logs[i].severity) {
        case 'I':
          ctx.strokeStyle = 'rgba(23, 162, 184, 0.05)';
          break;
        case 'W':
          ctx.strokeStyle = 'rgba(255, 193, 7, 0.1)';
          break;
        case 'E':
          ctx.strokeStyle = 'rgba(220, 53, 69, 0.5)';
          break;
        case 'F':
          ctx.strokeStyle = 'rgba(156, 39, 176, 0.1)';
          break;
      }
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(50, i);
      ctx.closePath();
      ctx.stroke();
    }
  }
});
