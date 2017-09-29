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
    this.model.observe(this.render.bind(this)); // refresh when data change
    this.el = this.element[0]; // get DOM element from widget
    this.render();

    this.rowHeight = 20; // px, to change if CSS change
    this.logsScrollTop = 0;

    // we need this element to watch its scroll position and render only the <td> inside the screen
    // so we are not rendering the <td> the user can't see
    // .container-table-logs will stay the same DOM element thanks to DOM diff algo
    // we do this after render so it exists
    this.logs = this.el.querySelector('.container-table-logs')
    this.logs.addEventListener('scroll', (e) => {
      requestAnimationFrame(this.render.bind(this));
    })
    window.addEventListener('resize', (e) => {
      requestAnimationFrame(this.render.bind(this));
    })
  },

  _destroy: function() {

  },

  render: function() {
    const model = this.model;
    const logs = model.logs;
    const columns = model.columns;

    this.logsScrollTop = this.logs ? this.logs.scrollTop : 0;
    this.logsOffsetHeight = this.logs ? this.logs.offsetHeight : 0;

    const nbRows = logs.length;
    const start = Math.round(this.logsScrollTop / this.rowHeight);
    const end = start + Math.round(this.logsOffsetHeight / this.rowHeight) + 1; // the last one is cut in half
    const slice = logs.slice(start, end);
    const allLogsHeight = nbRows * this.rowHeight;
    const sliceLogsHeight = slice.length * this.rowHeight;
    const paddingBottom = Math.max(allLogsHeight - sliceLogsHeight - this.logsScrollTop, 0);

    // handle max scroll possible: total height - table height
    // avoid cutting in half the last row or instable rendering (slice unstable)
    const marginTop = Math.min(this.logsScrollTop, allLogsHeight - sliceLogsHeight);

    const tableStr = `<div id="logs" class="${model.inspector() ? 'right-panel-open' : ''}">
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
          ${columns.run ? `<th class="text-overflow cell-bordered text-left col-50px">Run</th>` : ''}
          ${columns.errcode ? `<th class="text-overflow cell-bordered text-left col-50px">errCode</th>` : ''}
          ${columns.errline ? `<th class="text-overflow cell-bordered text-left col-50px">errLine</th>` : ''}
          ${columns.errsource ? `<th class="text-overflow cell-bordered text-left col-100px">errSource</th>` : ''}
          ${columns.message ? `<th class="text-overflow cell-bordered text-left col-max">Message</th>` : ''}
        </tr>
      </table>

      <div class="container-table-logs">
        <table class="table-hover table-bordered default-cursor" style="margin-top:${marginTop}px;margin-bottom:${paddingBottom}px;">
          <colgroup>
            ${columns.severity ? `<col class="col-100px">` : ''}
            ${columns.level ? `<col class="col-50px">` : ''}
            ${columns.date ? `<col class="col-100px">` : ''}
            ${columns.time ? `<col class="col-100px">` : ''}
            ${columns.hostname ? `<col class="col-100px">` : ''}
            ${columns.rolename ? `<col class="col-100px">` : ''}
            ${columns.pid ? `<col class="col-50px">` : ''}
            ${columns.username ? `<col class="col-100px">` : ''}
            ${columns.system ? `<col class="col-50px">` : ''}
            ${columns.facility ? `<col class="col-100px">` : ''}
            ${columns.detector ? `<col class="col-50px">` : ''}
            ${columns.partition ? `<col class="col-100px">` : ''}
            ${columns.run ? `<col class="col-50px">` : ''}
            ${columns.errcode ? `<col class="col-50px">` : ''}
            ${columns.errline ? `<col class="col-50px">` : ''}
            ${columns.errsource ? `<col class="col-100px">` : ''}
            ${columns.message ? `<col class="col-max">` : ''}
          </colgroup>
          <tbody>
            ${slice.map((row) => {
              let classSeverity = '';
              let textSeverity = '';
              if (row) {
                switch(row.severity) {
                  case 'I':
                    classSeverity = 'severity-i';
                    textSeverity = 'INFO';
                    break;
                  case 'W':
                    classSeverity = 'severity-w';
                    textSeverity = 'WARN';
                    break;
                  case 'E':
                    classSeverity = 'severity-e';
                    textSeverity = 'ERROR';
                    break;
                  case 'F':
                    classSeverity = 'severity-f';
                    textSeverity = 'FAIL';
                    break;

                  default:
                    break;
                }
              }

              let rowSelected = '';
              if (row === model.selected()) {
                rowSelected = 'row-selected';
              }

              return `
                <tr class="row-hover ${rowSelected}" onclick="app.selected('${row.virtualId}')">
                  ${columns.severity ? `<td class="text-overflow text-center cell-bordered ${classSeverity}">${textSeverity}</td>` : ''}
                  ${columns.level ? `<td class="text-overflow cell-bordered">${$.escapeHTML(row.level)}</td>` : ''}
                  ${columns.date ? `<td class="text-overflow cell-bordered">${new Date(row.timestamp * 1000).toLocaleDateString()}</td>` : ''}
                  ${columns.time ? `<td class="text-overflow cell-bordered">${new Date(row.timestamp * 1000).toLocaleTimeString()}</td>` : ''}
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
    </div>`;
    morphdom(this.el, tableStr);

    // Scrolling down will force a redraw, so we put it in next animation frame
    requestAnimationFrame(() => {
      if (model.live() && model.autoScroll()) {
        this.logs.scrollTop = this.logs.scrollHeight;
      }
    });
  }
});
