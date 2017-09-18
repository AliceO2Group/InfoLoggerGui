jQuery.widget('o2.logs', {
  _create: function() {
    console.log('logs widget created');

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
            ${model.logs.map(row => {
              const classSeverity = row.severity === 'I' ? 'col-severityI' : 'col-severityF';

              return `
                <tr>
                  ${columns.severity ? `<td class="text-overflow text-center ${classSeverity}">${htmlEscape(row.severity)}</td>` : ''}
                  ${columns.level ? `<td class="text-overflow text-left" title="${htmlEscape(row.level)}">${htmlEscape(row.level)}</td>` : ''}
                  ${columns.timestamp ? `<td class="text-overflow text-left" title="${htmlEscape(row.timestamp)}">${htmlEscape(row.timestamp)}</td>` : ''}
                  ${columns.hostname ? `<td class="text-overflow text-left" title="${htmlEscape(row.hostname)}">${htmlEscape(row.hostname)}</td>` : ''}
                  ${columns.rolename ? `<td class="text-overflow text-left" title="${htmlEscape(row.rolename)}">${htmlEscape(row.rolename)}</td>` : ''}
                  ${columns.pid ? `<td class="text-overflow text-left" title="${htmlEscape(row.pid)}">${htmlEscape(row.pid)}</td>` : ''}
                  ${columns.username ? `<td class="text-overflow text-left" title="${htmlEscape(row.username)}">${htmlEscape(row.username)}</td>` : ''}
                  ${columns.system ? `<td class="text-overflow text-left" title="${htmlEscape(row.system)}">${htmlEscape(row.system)}</td>` : ''}
                  ${columns.facility ? `<td class="text-overflow text-left" title="${htmlEscape(row.facility)}">${htmlEscape(row.facility)}</td>` : ''}
                  ${columns.detector ? `<td class="text-overflow text-left" title="${htmlEscape(row.detector)}">${htmlEscape(row.detector)}</td>` : ''}
                  ${columns.partition ? `<td class="text-overflow text-left" title="${htmlEscape(row.partition)}">${htmlEscape(row.partition)}</td>` : ''}
                  ${columns.run ? `<td class="text-overflow text-left" title="${htmlEscape(row.run)}">${htmlEscape(row.run)}</td>` : ''}
                  ${columns.errcode ? `<td class="text-overflow text-left" title="${htmlEscape(row.errcode)}">${htmlEscape(row.errcode)}</td>` : ''}
                  ${columns.errline ? `<td class="text-overflow text-left" title="${htmlEscape(row.errline)}">${htmlEscape(row.errline)}</td>` : ''}
                  ${columns.errsource ? `<td class="text-overflow text-left" title="${htmlEscape(row.errsource)}">${htmlEscape(row.errsource)}</td>` : ''}
                  ${columns.message ? `<td class="text-overflow text-left" title="${htmlEscape(row.message)}">${htmlEscape(row.message)}</td>` : ''}
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
