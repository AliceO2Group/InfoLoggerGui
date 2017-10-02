/* eslint max-len: 0 */
/* templates are better read with full length */

jQuery.widget('o2.filters', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('filters widget needs a model');
    }

    this.model = this.options.model;
    this.model.observe(this.render.bind(this)); // refresh when data change
    this.el = this.element[0]; // get DOM element from widget
    this.state = {
      datetimeFrom: '', // raw value from input without parsing
      datetimeTo: '', // raw value from input without parsing
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

    $(this.element).delegate('[data-criteria]', 'input', (e) => {
      const $target = $(e.target);
      const field = $target.data('field');
      const operator = $target.data('operator');
      let value = $target.val();
      const stateName = $target.data('state');

      // Parsing timestamp before sending to model
      if (field === 'timestamp') {
        this.state[stateName] = value; // save raw value locally
        value = $.parseDate(value);
      }

      this.model.criteria(field, operator, value);
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
          <select ${model.live() ? 'disabled' : ''}>
            <option selected>Any</option>
            <option>Shift ≤1</option>
            <option>Oncall ≤6</option>
            <option>Devel ≤11</option>
            <option>Debug ≤21</option>
          </select>
        </td>
        <td>
          <input type="text" tabindex="0" class="form-control input-datetime-from" data-criteria data-operator="morethan" data-field="timestamp" data-state="datetimeFrom" ${model.live() ? 'disabled' : ''} value="${this.state.datetimeFrom}" placeholder="from"/>
          ${datetimeHelper(this.state.datetimeFromFocus, model.criteria('timestamp', 'morethan'))}
        </td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="level" ${model.live() ? 'disabled' : ''} value="${filters.match.level}" placeholder="match"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="hostname" ${model.live() ? 'disabled' : ''} value="${filters.match.hostname}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="rolename" ${model.live() ? 'disabled' : ''} value="${filters.match.rolename}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="pid" ${model.live() ? 'disabled' : ''} value="${filters.match.pid}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="username" ${model.live() ? 'disabled' : ''} value="${filters.match.username}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="system" ${model.live() ? 'disabled' : ''} value="${filters.match.system}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="facility" ${model.live() ? 'disabled' : ''} value="${filters.match.facility}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="detector" ${model.live() ? 'disabled' : ''} value="${filters.match.detector}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="partition" ${model.live() ? 'disabled' : ''} value="${filters.match.partition}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="run" ${model.live() ? 'disabled' : ''} value="${filters.match.run}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="errcode" ${model.live() ? 'disabled' : ''} value="${filters.match.errcode}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="errline" ${model.live() ? 'disabled' : ''} value="${filters.match.errline}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="errsource" ${model.live() ? 'disabled' : ''} value="${filters.match.errsource}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="match" data-field="message" ${model.live() ? 'disabled' : ''} value="${filters.match.message}"/></td>
      </tr>
      <tr>
        <td>
          <input type="text" tabindex="1" class="form-control input-datetime-to" data-criteria data-operator="lessthan" data-field="timestamp" data-state="datetimeTo" ${model.live() ? 'disabled' : ''} value="${this.state.datetimeTo}"  placeholder="to"/>
          ${datetimeHelper(this.state.datetimeToFocus, model.criteria('timestamp', 'lessthan'))}
        </td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="level" ${model.live() ? 'disabled' : ''} value="${filters.exclude.level}" placeholder="exclude"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="hostname" ${model.live() ? 'disabled' : ''} value="${filters.exclude.hostname}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="rolename" ${model.live() ? 'disabled' : ''} value="${filters.exclude.rolename}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="pid" ${model.live() ? 'disabled' : ''} value="${filters.exclude.pid}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="username" ${model.live() ? 'disabled' : ''} value="${filters.exclude.username}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="system" ${model.live() ? 'disabled' : ''} value="${filters.exclude.system}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="facility" ${model.live() ? 'disabled' : ''} value="${filters.exclude.facility}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="detector" ${model.live() ? 'disabled' : ''} value="${filters.exclude.detector}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="partition" ${model.live() ? 'disabled' : ''} value="${filters.exclude.partition}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="run" ${model.live() ? 'disabled' : ''} value="${filters.exclude.run}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="errcode" ${model.live() ? 'disabled' : ''} value="${filters.exclude.errcode}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="errline" ${model.live() ? 'disabled' : ''} value="${filters.exclude.errline}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="errsource" ${model.live() ? 'disabled' : ''} value="${filters.exclude.errsource}"/></td>
        <td><input type="text" class="form-control" data-criteria data-operator="exclude" data-field="message" ${model.live() ? 'disabled' : ''} value="${filters.exclude.message}"/></td>
      </tr>
    </table>
  </form>
</div>`;

    function datetimeHelper(show, date) {
      return show ? `
        <div class="datetime-helper arrow-up-left">
          <div class="datetime-helper-result">
            <span>${date || 'Which datetime?'}</span>
          </div>

          <div class="datetime-helper-memo">
            <span>
              [hh:[mm[:ss[.mmm]]]<br>
              [DD[/MM[/YYYY]]]<br>
              <hr>
              +/-1day<br>
              +/-1hour<br>
              +/-1minute<br>
              +/-1second
              <hr>
              <i>Partial and mixed inputs are handled, eg: "-5m" means "now minus five minute". Mandatory parts are underlined.</i>
            </span>
          </div>
        </div>
      ` : '';
    }

    morphdom(this.el, template);
  }
});
