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
    this.logsContainer = this.options.logsContainer;
    this.model.observe((e) => {
      if (this.requestFrame) {
        cancelAnimationFrame(this.requestFrame);
      }
      this.requestFrame = requestAnimationFrame(this.render.bind(this)); // refresh when data change
    });
    this.el = this.element[0]; // get DOM element from widget
    this.canvas = null;
    this.ctx = null;
    this.mousedown = false;
    this.render();

    // On click, scroll to the position like a normal scroll-bar
    this.canvas.addEventListener('click', (e) => {
      const offsetTop = $(this.canvas).offset().top;
      const eventTop = e.pageY;
      const clickPositionY = eventTop - offsetTop;
      const logsLength = this.model.logs().length;
      const rowNumber = Math.round(clickPositionY / this.canvas.height * logsLength);
      $('.container-table-logs').scrollTop(
        clickPositionY / this.canvas.height * this.logsContainer.allLogsHeight - (this.logsContainer.maxSliceHeight / 2)
      )
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mousedown = true;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.mousedown) {
        return;
      }

      const offsetTop = $(this.canvas).offset().top;
      const eventTop = e.pageY;
      const clickPositionY = eventTop - offsetTop;
      const logsLength = this.model.logs().length;
      const rowNumber = Math.round(clickPositionY / this.canvas.height * logsLength);
      $('.container-table-logs').scrollTop(
        clickPositionY / this.canvas.height * this.logsContainer.allLogsHeight - (this.logsContainer.maxSliceHeight / 2)
      )
    });

    this.canvas.addEventListener('mouseout', (e) => {
      this.mousedown = false;
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.mousedown = false;
    });

    // Height will change on resize, re-render it
    window.addEventListener('resize', (e) => {
      requestAnimationFrame(this.render.bind(this));
    });
  },

  _destroy: function() {

  },

  render: function() {
    const model = this.model;
    const logs = model.logs();
    const logsLength = logs.length;

    var height = this.el.offsetHeight; // offsetHeight will force browser renderer
    const template = `<div id="minimap" class="unselectable-cursor ${model.minimap() ? 'left-panel-open' : ''}"><canvas width="30" height="${height}"></canvas></div>`;
    morphdom(this.el, template);

    if (!model.minimap()) {
      return; // hidden minimap, don't draw inside
    }

    if (!this.ctx) {
      // get the reference to the context and cache it
      this.canvas = this.el.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
    }

    if (height === 0) {
      // Element has just been displayed, rerender so we can take its height
      return requestAnimationFrame(this.render.bind(this));;
    }

    // Clear everything and reset scale factor
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, 30, 99729);

    // Draw position of the screen view (the gray area)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.rect(
      0, this.logsContainer.tableMarginTop / this.logsContainer.allLogsHeight * this.canvas.height, // x, y
      30, this.logsContainer.sliceLogsHeight / this.logsContainer.allLogsHeight * this.canvas.height // width, height
    );
    this.ctx.fill();

    // Zoom-out the scrollbar to fit the container's height
    this.ctx.scale(1, this.canvas.height / logsLength);

    // Draw a line for each log, a color per severity
    for (var i = 0; i < logsLength; i++) {
      switch(logs[i].severity) {
        case 'I':
          this.ctx.strokeStyle = 'rgba(23, 162, 184, 0.05)';
          break;
        case 'W':
          this.ctx.strokeStyle = 'rgba(255, 152, 0, 0.7)';
          break;
        case 'E':
          this.ctx.strokeStyle = 'rgba(220, 53, 69, 1)';
          break;
        case 'F':
          this.ctx.strokeStyle = 'rgba(156, 39, 176, 0.7)';
          break;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(50, i);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }
});
