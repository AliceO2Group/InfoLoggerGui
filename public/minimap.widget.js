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
    this.model.observe((e) => {
      if (this.requestFrame) {
        cancelAnimationFrame(this.requestFrame);
      }
      this.requestFrame = requestAnimationFrame(this.render.bind(this)); // refresh when data change
    });
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
      logsLength <= this.canvas.height ?
        $('.container-table-logs').scrollTop(clickPositionY * 20 - (ll.maxSliceHeight / 2))
        : $('.container-table-logs').scrollTop(clickPositionY / this.canvas.height * ll.allLogsHeight - (ll.maxSliceHeight / 2))
    });

    window.addEventListener('resize', (e) => {
      requestAnimationFrame(this.render.bind(this));
    });
  },

  _destroy: function() {

  },

  render: function() {
    const model = this.model;
    const logsLength = this.model.logs().length;

    const template = `<div id="minimap" class="${model.minimap() ? 'left-panel-open' : ''}"><canvas width="30" height="100%"></canvas></div>`;
    morphdom(this.el, template);

    if (!model.minimap()) {
      return; // don't work if not visible
    }

    if (!this.ctx) {
      // cache reference after first creation of the element
      this.canvas = this.el.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
    }

    // get reference from cache
    const ctx = this.ctx;
    this.canvas.height = this.el.offsetHeight; // this will force browser renderer

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 30, 99729);


    // position of the screen view
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.rect(
      0, logsLength <= this.canvas.height ? ll.tableMarginTop / 20 : ll.tableMarginTop / ll.allLogsHeight * this.canvas.height, // x, y
      30, logsLength <= this.canvas.height ? ll.maxSliceHeight / 20 : ll.sliceLogsHeight / ll.allLogsHeight * this.canvas.height // width, height
    );
    ctx.fill();

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
