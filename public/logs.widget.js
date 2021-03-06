/* eslint max-len: 0 */
/* templates are better read with full length */
/* eslint indent: 0 */
/* templates are not well recognized by eslint, js into tpl is not well handled */

jQuery.widget('o2.logs', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('logs widget needs a model');
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
    $('#minimap').minimap({model: this.options.model, logsContainer: this});

    this.rowHeight = 20; // px, to change if CSS change

    this.logsContainerScrollTop = 0;
    this.logsContainerOffsetHeight = 0;
    this.tablePaddingBottom = 0;
    this.tableMarginTop = 0;
    this.logsDisplayed = []; // contains only rows displayed for real

    // we need this element to watch its scroll position and render only the <td> inside the screen
    // so we are not rendering the <td> the user can't see
    // .container-table-logs will stay the same DOM element thanks to DOM diff algo
    // we do this after render so it exists
    this.logsContainer = this.el.querySelector('.container-table-logs')
    this.logsContainer.addEventListener('scroll', (e) => {
      requestAnimationFrame(this.render.bind(this));
      this.model.selected(this.model.selected());
    });

    window.addEventListener('resize', (e) => {
      requestAnimationFrame(this.render.bind(this));
    });
  },

  _destroy: function() {

  },

  /**
   * On live mode when new rows are coming and auto-scroll is on, scroll-down
   * @param {string} argName - blabla
   * @return {string} blabla
   */
  _autoScrollOnLive: function() {
    const logs = this.model.logs();

    if (this.model.live() && this.model.autoScroll() && this.previousLogsLength !== logs.length) {
      this.logsContainer.scrollTop = this.logsContainer.scrollHeight;
    }
    this.previousLogsLength = logs.length; // save for next render
  },

  /**
   * Auto-scroll top on logs reference change
   * for example when we clean and add new rows, just scroll top
   */
  _autoScrollOnReset: function() {
    const logs = this.model.logs();

    if (this.logsContainer && this.previousLogsModel !== logs) {
      this.logsContainer.scrollTop = 0;
    }
    this.previousLogsModel = logs; // save for next render
  },

  /**
   * Auto-scroll to selected row:
   * A row is selected and it was not the case earlier,
   * so let's scroll to it if not in the screen!
   */
  _autoScrollOnSelected: function() {
    const logs = this.model.logs();
    const selected = this.model.selected();

    if (this.logsContainer && selected && this.previousSelectedRow !== selected) {
      const viewportStart = this.logsContainerScrollTop;
      const viewportEnd = this.logsContainerScrollTop + this.logsContainerOffsetHeight - this.rowHeight;
      const selectedPosition = logs.indexOf(selected) * this.rowHeight;

      // if selected row is outside
      if (selectedPosition < viewportStart || viewportEnd < selectedPosition) {
        if (selectedPosition < viewportStart) {
          this.logsContainer.scrollTop = selectedPosition;
        }
        if (viewportEnd < selectedPosition) {
          this.logsContainer.scrollTop = selectedPosition - this.logsContainerOffsetHeight + this.rowHeight;
        }
      }
    }
    this.previousSelectedRow = selected; // save for next render
  },

  /**
   * Fake big scroll
   * Only dozen of rows are actually displayed in the table inside a big DIV scrolling
   * so we need to calculate the position of the table inside it
   * this is made for performance, DOM cannot handle 50k nodes
   */
  _computeTablePosition: function() {
    const logs = this.model.logs();

    const nbRows = logs.length;
    const start = Math.round(this.logsContainerScrollTop / this.rowHeight);
    const end = start + Math.round(this.logsContainerOffsetHeight / this.rowHeight) + 1; // the last one is cut in half
    this.maxSlice = Math.round(this.logsContainerOffsetHeight / this.rowHeight);
    this.maxSliceHeight = this.maxSlice * this.rowHeight;
    const slice = logs.slice(start, end);
    const allLogsHeight = nbRows * this.rowHeight;
    const sliceLogsHeight = slice.length * this.rowHeight;
    this.allLogsHeight = allLogsHeight;
    this.sliceLogsHeight = sliceLogsHeight;

    this.tablePaddingBottom = Math.max(allLogsHeight - sliceLogsHeight - this.logsContainerScrollTop, 0);
    // handle max scroll possible: total height - table height
    // avoid cutting in half the last row or instable rendering (slice unstable)
    this.tableMarginTop = Math.min(this.logsContainerScrollTop, allLogsHeight - sliceLogsHeight);
    this.logsDisplayed = slice;
  },

  render: function() {
    const model = this.model;
    const logs = model.logs();
    const columns = model.columns;
    const timezone = model.timezone();

    this.logsContainerScrollTop = this.logsContainer ? this.logsContainer.scrollTop : 0;
    this.logsContainerOffsetHeight = this.logsContainer ? this.logsContainer.offsetHeight : 0;

    this._autoScrollOnLive();
    this._autoScrollOnReset();
    this._autoScrollOnSelected();
    this._computeTablePosition();

    const tableStr = `<div id="logs" class="unselectable-cursor ${model.inspector() ? 'right-panel-open' : ''} ${model.minimap() ? 'left-panel-open' : ''}">
      <table class="table-logs-header table-bordered default-cursor">
        <tr>
          ${columns.severity ? `<th class="text-overflow cell-bordered text-center col-100px">Severity</th>` : ''}
          ${columns.level ? `<th class="text-overflow cell-bordered text-left col-50px">Level</th>` : ''}
          ${columns.date ? `<th class="text-overflow cell-bordered text-left col-100px">Date</th>` : ''}
          ${columns.time ? `<th class="text-overflow cell-bordered text-left col-100px">Time</th>` : ''}
          ${columns.hostname ? `<th class="text-overflow cell-bordered text-left col-100px">Hostname</th>` : ''}
          ${columns.rolename ? `<th class="text-overflow cell-bordered text-left col-100px">Rolename</th>` : ''}
          ${columns.pid ? `<th class="text-overflow cell-bordered text-left col-50px">Pid</th>` : ''}
          ${columns.username ? `<th class="text-overflow cell-bordered text-left col-100px">Username</th>` : ''}
          ${columns.system ? `<th class="text-overflow cell-bordered text-left col-50px">System</th>` : ''}
          ${columns.facility ? `<th class="text-overflow cell-bordered text-left col-100px">Facility</th>` : ''}
          ${columns.detector ? `<th class="text-overflow cell-bordered text-left col-50px">Detector</th>` : ''}
          ${columns.partition ? `<th class="text-overflow cell-bordered text-left col-100px">Partition</th>` : ''}
          ${columns.run ? `<th class="text-overflow cell-bordered text-left col-75px">Run</th>` : ''}
          ${columns.errcode ? `<th class="text-overflow cell-bordered text-left col-50px">errCode</th>` : ''}
          ${columns.errline ? `<th class="text-overflow cell-bordered text-left col-50px">errLine</th>` : ''}
          ${columns.errsource ? `<th class="text-overflow cell-bordered text-left col-100px">errSource</th>` : ''}
          ${columns.message ? `<th class="text-overflow cell-bordered text-left col-max">Message</th>` : ''}
        </tr>
      </table>

      <div class="container-table-logs ${model.minimap() ? 'hide-scroll-bar' : ''}">
        <table class="table-hover table-bordered default-cursor" style="margin-top:${this.tableMarginTop}px;margin-bottom:${this.tablePaddingBottom}px;">
          <colgroup>
            ${columns.severity ? `<col class="col-100px col-max-last">` : ''}
            ${columns.level ? `<col class="col-50px col-max-last">` : ''}
            ${columns.date ? `<col class="col-100px col-max-last">` : ''}
            ${columns.time ? `<col class="col-100px col-max-last">` : ''}
            ${columns.hostname ? `<col class="col-100px col-max-last">` : ''}
            ${columns.rolename ? `<col class="col-100px col-max-last">` : ''}
            ${columns.pid ? `<col class="col-50px col-max-last">` : ''}
            ${columns.username ? `<col class="col-100px col-max-last">` : ''}
            ${columns.system ? `<col class="col-50px col-max-last">` : ''}
            ${columns.facility ? `<col class="col-100px col-max-last">` : ''}
            ${columns.detector ? `<col class="col-50px col-max-last">` : ''}
            ${columns.partition ? `<col class="col-100px col-max-last">` : ''}
            ${columns.run ? `<col class="col-75px col-max-last">` : ''}
            ${columns.errcode ? `<col class="col-50px col-max-last">` : ''}
            ${columns.errline ? `<col class="col-50px col-max-last">` : ''}
            ${columns.errsource ? `<col class="col-100px col-max-last">` : ''}
            ${columns.message ? `<col class="col-max-last">` : ''}
          </colgroup>
          <tbody>
            ${this.logsDisplayed.map((row) => {
              let rowSelected = '';
              const isRowSelected = row === model.selected();
              if (isRowSelected) {
                rowSelected = 'row-selected';
              }

              let classSeverity = '';
              let textSeverity = '';
              if (row) {
                switch(row.severity) {
                  case 'I':
                    classSeverity = 'severity-i';
                    textSeverity = 'INFO';
                    break;
                  case 'W':
                    // selected row is in blue, switch bgColor to fontColor when selected
                    classSeverity = isRowSelected ? 'severity-w' : 'severity-w-bg';
                    textSeverity = 'WARN';
                    break;
                  case 'E':
                    // selected row is in blue, switch bgColor to fontColor when selected
                    classSeverity = isRowSelected ? 'severity-e' : 'severity-e-bg';
                    textSeverity = 'ERROR';
                    break;
                  case 'F':
                    // selected row is in blue, switch bgColor to fontColor when selected
                    classSeverity = isRowSelected ? 'severity-f' : 'severity-f-bg';
                    textSeverity = 'FATAL';
                    break;

                  default:
                    break;
                }
              }

              return `
                <tr class="row-hover ${rowSelected}" onclick="app.selected('${row.virtualId}')">
                  ${columns.severity ? `<td class="text-overflow text-center cell-bordered text-strong ${classSeverity}">${textSeverity}</td>` : ''}
                  ${columns.level ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.level)}</td>` : ''}
                  ${columns.date ? `<td class="text-overflow cell-bordered">${$.datetime(row.timestamp, 'date', timezone)}</td>` : ''}
                  ${columns.time ? `<td class="text-overflow cell-bordered">${$.datetime(row.timestamp, 'time', timezone)}</td>` : ''}
                  ${columns.hostname ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.hostname)}</td>` : ''}
                  ${columns.rolename ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.rolename)}</td>` : ''}
                  ${columns.pid ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.pid)}</td>` : ''}
                  ${columns.username ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.username)}</td>` : ''}
                  ${columns.system ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.system)}</td>` : ''}
                  ${columns.facility ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.facility)}</td>` : ''}
                  ${columns.detector ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.detector)}</td>` : ''}
                  ${columns.partition ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.partition)}</td>` : ''}
                  ${columns.run ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.run)}</td>` : ''}
                  ${columns.errcode ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.errcode)}</td>` : ''}
                  ${columns.errline ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.errline)}</td>` : ''}
                  ${columns.errsource ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.errsource)}</td>` : ''}
                  ${columns.message ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.message)}</td>` : ''}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div id="minimap"></div>
    </div>`;
    morphdom(this.el, tableStr, {
      onBeforeElUpdated: (fromEl, toEl) => {
        // Don't redraw widgets, they are redrawing by themselve
        if (fromEl.id === 'minimap') {
          return false;
        }
      }
    });
  }
});
