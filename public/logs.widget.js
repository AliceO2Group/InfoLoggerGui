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
    this.render();
  },

  render: function() {
    const el = this.element;
    const model = this.model;
    const columns = model.columns;

    const tableStr = `<div>
      <table class="table-logs-header table-bordered">
        <tr>
          ${columns.severity ? `<th class="text-center col-100px">Severity</th>` : ''}
          ${columns.level ? `<th class="text-left col-50px">Level</th>` : ''}
          ${columns.timestamp ? `<th class="text-left col-100px">Timestamp</th>` : ''}
          ${columns.hostname ? `<th class="text-left col-100px">Hostname</th>` : ''}
          ${columns.rolename ? `<th class="text-left col-100px">Rolename</th>` : ''}
          ${columns.pid ? `<th class="text-left col-50px">Pid</th>` : ''}
          ${columns.username ? `<th class="text-left col-100px">Username</th>` : ''}
          ${columns.system ? `<th class="text-left col-50px">System</th>` : ''}
          ${columns.facility ? `<th class="text-left col-100px">Facility</th>` : ''}
          ${columns.detector ? `<th class="text-left col-50px">Detector</th>` : ''}
          ${columns.partition ? `<th class="text-left col-100px">Partition</th>` : ''}
          ${columns.run ? `<th class="text-left col-50px">Run</th>` : ''}
          ${columns.errcode ? `<th class="text-left col-50px">errCode</th>` : ''}
          ${columns.errline ? `<th class="text-left col-50px">errLine</th>` : ''}
          ${columns.errsource ? `<th class="text-left col-100px">errSource</th>` : ''}
          ${columns.message ? `<th class="text-left col-max">Message</th>` : ''}
        </tr>
      </table>

      <div class="container-table-logs">
        <table class="table-hover table-bordered">
          <colgroup>
            ${columns.severity ? `<col class="col-100px">` : ''}
            ${columns.level ? `<col class="col-50px">` : ''}
            ${columns.timestamp ? `<col class="col-100px">` : ''}
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
            ${model.logs.map((row) => {
              let classSeverity;
              switch(row.severity) {
                case 'I':
                  classSeverity = 'severity-i';
                  break;
                case 'W':
                  classSeverity = 'severity-w';
                  break;
                case 'E':
                  classSeverity = 'severity-e';
                  break;
                case 'F':
                  classSeverity = 'severity-f';
                  break;

                default:
                  classSeverity = '';
                  break;
              }

              return `
                <tr>
                  ${columns.severity ? `<td class="text-overflow text-center ${classSeverity}">${$.escapeHTML(row.severity)}</td>` : ''}
                  ${columns.level ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.level)}">${$.escapeHTML(row.level)}</td>` : ''}
                  ${columns.timestamp ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.timestamp)}">${$.escapeHTML(row.timestamp)}</td>` : ''}
                  ${columns.hostname ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.hostname)}">${$.escapeHTML(row.hostname)}</td>` : ''}
                  ${columns.rolename ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.rolename)}">${$.escapeHTML(row.rolename)}</td>` : ''}
                  ${columns.pid ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.pid)}">${$.escapeHTML(row.pid)}</td>` : ''}
                  ${columns.username ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.username)}">${$.escapeHTML(row.username)}</td>` : ''}
                  ${columns.system ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.system)}">${$.escapeHTML(row.system)}</td>` : ''}
                  ${columns.facility ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.facility)}">${$.escapeHTML(row.facility)}</td>` : ''}
                  ${columns.detector ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.detector)}">${$.escapeHTML(row.detector)}</td>` : ''}
                  ${columns.partition ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.partition)}">${$.escapeHTML(row.partition)}</td>` : ''}
                  ${columns.run ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.run)}">${$.escapeHTML(row.run)}</td>` : ''}
                  ${columns.errcode ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.errcode)}">${$.escapeHTML(row.errcode)}</td>` : ''}
                  ${columns.errline ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.errline)}">${$.escapeHTML(row.errline)}</td>` : ''}
                  ${columns.errsource ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.errsource)}">${$.escapeHTML(row.errsource)}</td>` : ''}
                  ${columns.message ? `<td class="text-overflow text-left" title="${$.escapeHTML(row.message)}">${$.escapeHTML(row.message)}</td>` : ''}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
    morphdom(el[0], tableStr);
  }
});
