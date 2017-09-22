/* eslint max-len: 0 */
/* templates are better read with full length */

jQuery.widget('o2.filters', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('filters widget needs a model');
    }

    this.model = this.options.model;
    this.model.observe(this.render.bind(this)); // refresh when data change
    this.render();

    $(this.element).delegate('[data-action="display"]', 'click', (e) => {
      const $target = $(e.target);
      const fieldName = $target.data('field');
      const previousValue = this.model.columns[fieldName];
      this.model.displayField(fieldName, !previousValue);
    });

    $(this.element).delegate('[data-action="match"]', 'input', (e) => {
      const $target = $(e.target);
      this.model.matchField($target.data('field'), $target.val());
    });

    $(this.element).delegate('[data-action="exclude"]', 'input', (e) => {
      const $target = $(e.target);
      this.model.excludeField($target.data('field'), $target.val());
    });
  },

  render: function() {
    const el = this.element;
    const model = this.model;
    const columns = model.columns;
    const filters = model.filters;

    let str = `
    <table>
      <tr>
        <td></td>
        <td><button class="btn btn-block ${columns.severity ? 'active':''}" data-action="display" data-field="severity">Severity</button></td>
        <td><button class="btn btn-block ${columns.level ? 'active':''}" data-action="display" data-field="level">Level</button></td>
        <td><button class="btn btn-block ${columns.timestamp ? 'active':''}" data-action="display" data-field="timestamp">Timestamp</button></td>
        <td><button class="btn btn-block ${columns.hostname ? 'active':''}" data-action="display" data-field="hostname">Hostname</button></td>
        <td><button class="btn btn-block ${columns.rolename ? 'active':''}" data-action="display" data-field="rolename">Rolename</button></td>
        <td><button class="btn btn-block ${columns.pid ? 'active':''}" data-action="display" data-field="pid">PID</button></td>
        <td><button class="btn btn-block ${columns.username ? 'active':''}" data-action="display" data-field="username">Username</button></td>
        <td><button class="btn btn-block ${columns.system ? 'active':''}" data-action="display" data-field="system">System</button></td>
        <td><button class="btn btn-block ${columns.facility ? 'active':''}" data-action="display" data-field="facility">Facility</button></td>
        <td><button class="btn btn-block ${columns.detector ? 'active':''}" data-action="display" data-field="detector">Detector</button></td>
        <td><button class="btn btn-block ${columns.partition ? 'active':''}" data-action="display" data-field="partition">Partition</button></td>
        <td><button class="btn btn-block ${columns.run ? 'active':''}" data-action="display" data-field="run">Run</button></td>
        <td><button class="btn btn-block ${columns.errcode ? 'active':''}" data-action="display" data-field="errcode">ErrCode</button></td>
        <td><button class="btn btn-block ${columns.errline ? 'active':''}" data-action="display" data-field="errline">ErrLine</button></td>
        <td><button class="btn btn-block ${columns.errsource ? 'active':''}" data-action="display" data-field="errsource">ErrSource</button></td>
        <td><button class="btn btn-block ${columns.message ? 'active':''}" data-action="display" data-field="message">Message</button></td>
      </tr>
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
    morphdom(el[0], `<div id="filters">${str}</div>`);
  }
});
