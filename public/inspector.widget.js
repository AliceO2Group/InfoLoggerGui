/* eslint max-len: 0 */
/* templates are better read with full length */
/* eslint indent: 0 */
/* templates are not well recognized by eslint, js into tpl is not well handled */

jQuery.widget('o2.inspector', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('inspector widget needs a model');
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

    $(this.element).delegate('[copy-table-action]', 'click', (e) => {
      const table = this.el.querySelector('.inspector-table');
      if (table) {
        $.toClipboard(table);
      }
    });

    $(this.element).delegate('[data-search]', 'click', (e) => {
      const model = this.options.model;
      const $target = $(e.target);
      const field = $target.data('search');
      const row = model.selected();
      const value = row[field];

      if (field === 'timestamp') {
        return model.rawFilter(field, '$gte', $.datetime(value, 'datetime', this.model.timezone()));
      }

      model.rawFilter(field, '$in', value);
    });
  },

  _destroy: function() {

  },

  render: function() {
    const model = this.model;
    const row = model.selected();

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

    const template = `<div id="inspector" class="${model.inspector() ? 'right-panel-open' : ''}">
      <div class="inspector-container">
        ${!row
          ? `<p class="text-center inspector-default">Select a row</p>`
          : `<div class="inspector-content">
            <table class="inspector-table">
              <tr><td class="col-100px inspector-cell text-right">Severity :</td><td class="text-wrap-break ${classSeverity}">${textSeverity}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Level :</td><td class="text-wrap-break">${$.escapeHTML(row.level)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Timestamp :</td><td class="text-wrap-break">${$.datetime(row.timestamp, 'datetime', model.timezone())}<span class="inspector-quick-search default-cursor" data-search="timestamp"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Hostname :</td><td class="text-wrap-break">${$.escapeHTML(row.hostname)}<span class="inspector-quick-search default-cursor" data-search="hostname"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Rolename :</td><td class="text-wrap-break">${$.escapeHTML(row.rolename)}<span class="inspector-quick-search default-cursor" data-search="rolename"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Pid :</td><td class="text-wrap-break">${$.escapeHTML(row.pid)}<span class="inspector-quick-search default-cursor" data-search="pid"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Username :</td><td class="text-wrap-break">${$.escapeHTML(row.username)}<span class="inspector-quick-search default-cursor" data-search="username"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">System :</td><td class="text-wrap-break">${$.escapeHTML(row.system)}<span class="inspector-quick-search default-cursor" data-search="system"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Facility :</td><td class="text-wrap-break">${$.escapeHTML(row.facility)}<span class="inspector-quick-search default-cursor" data-search="facility"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Detector :</td><td class="text-wrap-break">${$.escapeHTML(row.detector)}<span class="inspector-quick-search default-cursor" data-search="detector"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Partition :</td><td class="text-wrap-break">${$.escapeHTML(row.partition)}<span class="inspector-quick-search default-cursor" data-search="partition"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Run :</td><td class="text-wrap-break">${$.escapeHTML(row.run)}<span class="inspector-quick-search default-cursor" data-search="run"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Errcode :</td><td class="text-wrap-break">${$.escapeHTML(row.errcode)}<span class="inspector-quick-search default-cursor" data-search="errcode"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Errline :</td><td class="text-wrap-break">${$.escapeHTML(row.errline)}<span class="inspector-quick-search default-cursor" data-search="errline"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Errsource :</td><td class="text-wrap-break">${$.escapeHTML(row.errsource)}<span class="inspector-quick-search default-cursor" data-search="errsource"> 🔍</span></td></tr>
              <tr><td class="col-100px inspector-cell text-right">Message :</td><td class="text-wrap-break">${$.escapeHTML(row.message)}</td></tr>
            </table>
          </div>
          <div class="inspector-content">
            <div><button class="btn" copy-table-action>Copy log details to clipboard</button></div>
            ${
              row.errcode
              ? `<div><a class="btn" href="https://alice-daq.web.cern.ch/error_codes/${$.escapeHTML(row.errcode)}" target="_blank">Go to wiki for error ${$.escapeHTML(row.errcode)}</a></div>`
              : ''
            }
          </div>
          `
        }
      </div>
    </div>`;
    morphdom(this.el, template);
  }
});
