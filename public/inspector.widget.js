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
    this.model.observe(this.render.bind(this)); // refresh when data change
    this.el = this.element[0]; // get DOM element from widget
    this.render();

    $(this.element).delegate('.copy-table', 'click', (e) => {
      const table = this.el.querySelector('.inspector-table');
      if (table) {
        $.toClipboard(table);
      }
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
          ? `<p class="text-center">Select a row</p>`
          : `<div class="inspector-content">
            <table class="inspector-table">
              <tr><td class="col-100px inspector-cell text-right">Severity :</td><td class="text-wrap-break ${classSeverity}">${textSeverity}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Level :</td><td class="text-wrap-break">${$.escapeHTML(row.level)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Timestamp :</td><td class="text-wrap-break">${$.escapeHTML(row.timestamp)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Hostname :</td><td class="text-wrap-break">${$.escapeHTML(row.hostname)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Rolename :</td><td class="text-wrap-break">${$.escapeHTML(row.rolename)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Pid :</td><td class="text-wrap-break">${$.escapeHTML(row.pid)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Username :</td><td class="text-wrap-break">${$.escapeHTML(row.username)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">System :</td><td class="text-wrap-break">${$.escapeHTML(row.system)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Facility :</td><td class="text-wrap-break">${$.escapeHTML(row.facility)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Detector :</td><td class="text-wrap-break">${$.escapeHTML(row.detector)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Partition :</td><td class="text-wrap-break">${$.escapeHTML(row.partition)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Run :</td><td class="text-wrap-break">${$.escapeHTML(row.run)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Errcode :</td><td class="text-wrap-break">${$.escapeHTML(row.errcode)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Errline :</td><td class="text-wrap-break">${$.escapeHTML(row.errline)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Errsource :</td><td class="text-wrap-break">${$.escapeHTML(row.errsource)}</td></tr>
              <tr><td class="col-100px inspector-cell text-right">Message :</td><td class="text-wrap-break">${$.escapeHTML(row.message)}</td></tr>
            </table>
          </div>
          <div class="inspector-content">
            <button class="btn copy-table">Copy the table</button>
          </div>
          `
        }
      </div>
    </div>`;
    morphdom(this.el, template);
  }
});
