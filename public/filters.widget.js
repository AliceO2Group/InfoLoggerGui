jQuery.widget('o2.filters', {
  _create: function() {
    console.log('filters widget created');

    if (!this.options.model) {
      throw new Error('filters widget needs a model');
    }

    this.model = this.options.model;
    // don't render a second time, this remove focus if user was writting
    // missing virtua-dom for this template engine
    // this.model.observe(this.render.bind(this)); // refresh when data change
    this.render();

    $(this.element).delegate('[data-action="display"]', 'change', e => {
      var $target = $(e.target);
      this.model.displayField($target.data('field'), $target.prop('checked'));
    });

    $(this.element).delegate('[data-action="match"]', 'input', e => {
      var $target = $(e.target);
      this.model.matchField($target.data('field'), $target.val());
    });

    $(this.element).delegate('[data-action="exclude"]', 'input', e => {
      var $target = $(e.target);
      this.model.excludeField($target.data('field'), $target.val());
    });
  },

  render: function() {
    const el = this.element;
    const model = this.model;
    const columns = model.columns;
    const filters = model.filters;
    var str = '';

    str = `
    <table>
      <tr>
        <td></td>
        <td>Severity</td>
        <td>Level</td>
        <td>Timestamp</td>
        <td>Hostname</td>
        <td>Rolename</td>
        <td>PID</td>
        <td>Username</td>
        <td>System</td>
        <td>Facility</td>
        <td>Detector</td>
        <td>Partition</td>
        <td>Run</td>
        <td>ErrCode</td>
        <td>ErrLine</td>
        <td>ErrSource</td>
        <td>Message</td>
      </tr>
      <tr>
        <td>Display</td>
        <td><input type="checkbox" data-action="display" data-field="severity" ${columns.severity ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="level" ${columns.level ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="timestamp" ${columns.timestamp ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="hostname" ${columns.hostname ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="rolename" ${columns.rolename ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="pid" ${columns.pid ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="username" ${columns.username ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="system" ${columns.system ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="facility" ${columns.facility ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="detector" ${columns.detector ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="partition" ${columns.partition ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="run" ${columns.run ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="errcode" ${columns.errcode ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="errline" ${columns.errline ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="errsource" ${columns.errsource ? 'checked' : ''}/></td>
        <td><input type="checkbox" data-action="display" data-field="message" ${columns.message ? 'checked' : ''}/></td>
      </tr>
      <tr>
      <tr>
        <td>Match</td>
        <td><input type="text" data-action="match" data-field="severity" value="${filters.match.severity}"/></td>
        <td><input type="text" data-action="match" data-field="level" value="${filters.match.level}"/></td>
        <td><input type="text" data-action="match" data-field="timestamp" value="${filters.match.timestamp}"/></td>
        <td><input type="text" data-action="match" data-field="hostname" value="${filters.match.hostname}"/></td>
        <td><input type="text" data-action="match" data-field="rolename" value="${filters.match.rolename}"/></td>
        <td><input type="text" data-action="match" data-field="pid" value="${filters.match.pid}"/></td>
        <td><input type="text" data-action="match" data-field="username" value="${filters.match.username}"/></td>
        <td><input type="text" data-action="match" data-field="system" value="${filters.match.system}"/></td>
        <td><input type="text" data-action="match" data-field="facility" value="${filters.match.facility}"/></td>
        <td><input type="text" data-action="match" data-field="detector" value="${filters.match.detector}"/></td>
        <td><input type="text" data-action="match" data-field="partition" value="${filters.match.partition}"/></td>
        <td><input type="text" data-action="match" data-field="run" value="${filters.match.run}"/></td>
        <td><input type="text" data-action="match" data-field="errcode" value="${filters.match.errcode}"/></td>
        <td><input type="text" data-action="match" data-field="errline" value="${filters.match.errline}"/></td>
        <td><input type="text" data-action="match" data-field="errsource" value="${filters.match.errsource}"/></td>
        <td><input type="text" data-action="match" data-field="message" value="${filters.match.message}"/></td>
      </tr>
      <tr>
        <td>Exclude</td>
        <td><input type="text" data-action="exclude" data-field="severity" value="${filters.exclude.severity}"/></td>
        <td><input type="text" data-action="exclude" data-field="level" value="${filters.exclude.level}"/></td>
        <td><input type="text" data-action="exclude" data-field="timestamp" value="${filters.exclude.timestamp}"/></td>
        <td><input type="text" data-action="exclude" data-field="hostname" value="${filters.exclude.hostname}"/></td>
        <td><input type="text" data-action="exclude" data-field="rolename" value="${filters.exclude.rolename}"/></td>
        <td><input type="text" data-action="exclude" data-field="pid" value="${filters.exclude.pid}"/></td>
        <td><input type="text" data-action="exclude" data-field="username" value="${filters.exclude.username}"/></td>
        <td><input type="text" data-action="exclude" data-field="system" value="${filters.exclude.system}"/></td>
        <td><input type="text" data-action="exclude" data-field="facility" value="${filters.exclude.facility}"/></td>
        <td><input type="text" data-action="exclude" data-field="detector" value="${filters.exclude.detector}"/></td>
        <td><input type="text" data-action="exclude" data-field="partition" value="${filters.exclude.partition}"/></td>
        <td><input type="text" data-action="exclude" data-field="run" value="${filters.exclude.run}"/></td>
        <td><input type="text" data-action="exclude" data-field="errcode" value="${filters.exclude.errcode}"/></td>
        <td><input type="text" data-action="exclude" data-field="errline" value="${filters.exclude.errline}"/></td>
        <td><input type="text" data-action="exclude" data-field="errsource" value="${filters.exclude.errsource}"/></td>
        <td><input type="text" data-action="exclude" data-field="message" value="${filters.exclude.message}"/></td>
      </tr>
    </table>
    `;

    // virtual-dom should be used here to avoid losing text selection and scroll position
    $(el).html(str);
  }
});
