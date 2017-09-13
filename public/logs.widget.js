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
    var str = '';

    const columns = model.columns;

    model.logs.forEach(row => {
      const classSeverity = row.severity === 'I' ? 'col-severityI' : 'col-severityF';


      str += `
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
          ${columns.message ? `<td text-overflow text-left" title="${htmlEscape(row.message)}">${htmlEscape(row.message)}</td>` : ''}
        </tr>
      `;
    });

    // virtual-dom should be used here to avoid losing text selection and scroll position
      $(this.element).html(`  <div class="table-fixed">
      <div class="table-fixed-container">
        <table class="table-fixed-content">
          <thead>
            <tr>
              ${columns.severity ? `<th class="col-100px"><div>Severity</div></th>` : ''}
              ${columns.level ? `<th class="col-50px"><div>Level</div></th>` : ''}
              ${columns.timestamp ? `<th class="col-100px"><div>Timestamp</div></th>` : ''}
              ${columns.hostname ? `<th class="col-100px"><div>Hostname</div></th>` : ''}
              ${columns.rolename ? `<th class="col-100px"><div>Rolename</div></th>` : ''}
              ${columns.pid ? `<th class="col-50px"><div>Pid</div></th>` : ''}
              ${columns.username ? `<th class="col-100px"><div>Username</div></th>` : ''}
              ${columns.system ? `<th class="col-50px"><div>System</div></th>` : ''}
              ${columns.facility ? `<th class="col-100px"><div>Facility</div></th>` : ''}
              ${columns.detector ? `<th class="col-50px"><div>Detector</div></th>` : ''}
              ${columns.partition ? `<th class="col-100px"><div>Partition</div></th>` : ''}
              ${columns.run ? `<th class="col-50px"><div>Run</div></th>` : ''}
              ${columns.errcode ? `<th class="col-50px"><div>errCode</div></th>` : ''}
              ${columns.errline ? `<th class="col-50px"><div>errLine</div></th>` : ''}
              ${columns.errsource ? `<th class="col-100px"><div>errSource</div></th>` : ''}
              ${columns.message ? `<th class="col-max"><div>Message</div></th>` : ''}
            </tr>
          </thead>
          <tbody>

          </tbody>
        </table>
      </div>
    </div>`);
    $(el).find('tbody').html(str);
  }
});

