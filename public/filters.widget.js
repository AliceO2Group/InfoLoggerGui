/* eslint max-len: 0 */
/* templates are better read with full length */

jQuery.widget('o2.filters', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('filters widget needs a model');
    }

    this.model = this.options.model;
    this.model.observe((e) => {
      if (this.requestFrame) {
        cancelAnimationFrame(this.requestFrame);
      }
      this.requestFrame = requestAnimationFrame(this.render.bind(this)); // refresh when data change
    });
    this.el = this.element[0]; // get DOM element from widget
    this.state = {
      datetimeFromFocus: false, // internal state to show datetime help
      datetimeToFocus: false, // internal state to show datetime help
    };
    this.render();

    $(this.element).delegate('[data-action="display"]', 'click', (e) => {
      const $target = $(e.target);
      const fieldName = $target.data('field');
      const previousValue = this.model.columns[fieldName];
      this.model.displayField(fieldName, !previousValue);
    });

    // This widget store internal state of its inputs to render them
    // And the value is sent to model with the appropriate type (string/date/number) and operator
    $(this.element).delegate('[data-criteria]', 'input', (e) => {
      const $target = $(e.target);
      const field = $target.data('field');
      const operator = $target.data('operator');
      const value = $target.val();

      this.model.rawFilter(field, operator, value);
    });

    $(this.element).delegate('.input-datetime-from', 'focus', (e) => {
      this.state.datetimeFromFocus = true;
      this.render();
    });

    $(this.element).delegate('.input-datetime-from', 'blur', (e) => {
      this.state.datetimeFromFocus = false;
      this.render();
    });

    $(this.element).delegate('.input-datetime-to', 'focus', (e) => {
      this.state.datetimeToFocus = true;
      this.render();
    });

    $(this.element).delegate('.input-datetime-to', 'blur', (e) => {
      this.state.datetimeToFocus = false;
      this.render();
    });

    $(this.element).delegate('form', 'submit', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.model.query();
    });
  },

  render: function() {
    const el = this.element;
    const model = this.model;
    const columns = model.columns;
    const filters = model.filters;

    const template = `<div id="filters">

  <form class="d-flex">
    <input type="submit" class="hidden">
    <table class="">
      <tr>
        <td><button type="button" class="btn btn-block text-overflow ${columns.level ? 'active':''}" data-action="display" data-field="level">Level</button></td>
        <td class="col-150px">
          <div class="d-flex">
            <button type="button" class="btn btn-block text-overflow ${columns.date ? 'active':''}" data-action="display" data-field="date">Date</button>
            <button type="button" class="btn btn-block text-overflow ${columns.time ? 'active':''}" data-action="display" data-field="time">Time</button>
          </div>
        </td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.severity ? 'active':''}" data-action="display" data-field="severity">Severity</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.hostname ? 'active':''}" data-action="display" data-field="hostname">Hostname</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.rolename ? 'active':''}" data-action="display" data-field="rolename">Rolename</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.pid ? 'active':''}" data-action="display" data-field="pid">PID</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.username ? 'active':''}" data-action="display" data-field="username">Username</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.system ? 'active':''}" data-action="display" data-field="system">System</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.facility ? 'active':''}" data-action="display" data-field="facility">Facility</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.detector ? 'active':''}" data-action="display" data-field="detector">Detector</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.partition ? 'active':''}" data-action="display" data-field="partition">Partition</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.run ? 'active':''}" data-action="display" data-field="run">Run</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.errcode ? 'active':''}" data-action="display" data-field="errcode">ErrCode</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.errline ? 'active':''}" data-action="display" data-field="errline">ErrLine</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.errsource ? 'active':''}" data-action="display" data-field="errsource">ErrSource</button></td>
        <td><button type="button" class="btn btn-block text-overflow ${columns.message ? 'active':''}" data-action="display" data-field="message">Message</button></td>
      </tr>
      <tr>
        <td rowspan="2">
          <select ${model.live() ? 'disabled' : ''} data-criteria data-operator="$lte" data-field="level">
            <option value="" ${!model.rawFilter('level', '$lte') ? 'selected' : ''}>Any</option>
            <option value="1" ${model.rawFilter('level', '$lte') === '1' ? 'selected' : ''}>Shift ≤1</option>
            <option value="6" ${model.rawFilter('level', '$lte') === '6' ? 'selected' : ''}>Oncall ≤6</option>
            <option value="11" ${model.rawFilter('level', '$lte') === '11' ? 'selected' : ''}>Devel ≤11</option>
            <option value="21" ${model.rawFilter('level', '$lte') === '21' ? 'selected' : ''}>Debug ≤21</option>
          </select>
        </td>
        <td>
          <input type="text" tabindex="1" class="form-control input-datetime-from" data-criteria data-operator="$gte" data-field="timestamp" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('timestamp', '$gte')}" placeholder="from"/>
          ${datetimeHelper(this.state.datetimeFromFocus, model.parsedFilters('timestamp', '$gte'))}
        </td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="severity" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('severity', '$in') || ''}" placeholder="match"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="hostname" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('hostname', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="rolename" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('rolename', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="pid" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('pid', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="username" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('username', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="system" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('system', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="facility" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('facility', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="detector" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('detector', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="partition" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('partition', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="run" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('run', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="errcode" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('errcode', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="errline" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('errline', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="errsource" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('errsource', '$in') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$in" data-field="message" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('message', '$in') || ''}"/></td>
      </tr>
      <tr>
        <td>
          <input type="text" tabindex="2" class="form-control input-datetime-to" data-criteria data-operator="$lte" data-field="timestamp" data-state="datetimeTo" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('timestamp', '$lte')}"  placeholder="to"/>
          ${datetimeHelper(this.state.datetimeToFocus, model.parsedFilters('timestamp', '$lte'))}
        </td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="severity" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('severity', '$nin') || ''}" placeholder="exclude"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="hostname" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('hostname', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="rolename" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('rolename', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="pid" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('pid', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="username" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('username', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="system" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('system', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="facility" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('facility', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="detector" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('detector', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="partition" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('partition', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="run" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('run', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="errcode" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('errcode', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="errline" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('errline', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="errsource" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('errsource', '$nin') || ''}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="$nin" data-field="message" ${model.live() ? 'disabled' : ''} value="${model.rawFilter('message', '$nin') || ''}"/></td>
      </tr>
    </table>
  </form>
</div>`;

    function datetimeHelper(show, date) {
      return show ? `
        <div class="datetime-helper arrow-up-left">
          <div class="datetime-helper-result">
            <span>${date ? $.datetime(date, 'datetime', model.timezone()) : 'Which datetime?'}</span>
          </div>

          <div class="datetime-helper-memo">
            <span>
              [hh:[mm[:ss[.mmm]]]<span class="pull-right">absolute time</span><br>
              [DD/[MM[/YYYY]]]<span class="pull-right">absolute day midnight</span><br>
              <hr>
              [+/-[N]d]<span class="pull-right">relative days</span><br>
              [+/-[N]h]<span class="pull-right">relative hours</span><br>
              [+/-[N]m]<span class="pull-right">relative minutes</span><br>
              [+/-[N]s]<span class="pull-right">relative seconds</span>
              <hr>
              <i>Examples:<br>
              "2/9/12 20:00" second day of septembre 2012, 8pm<br>
              "2/ 20:" second day of this month, 8pm<br>
              "-1d 6:00" yesterday at 6am<br>
              "-d 6:" yesterday at 6am</i>
            </span>
          </div>
        </div>
      ` : '';
    }

    morphdom(this.el, template);
  }
});
