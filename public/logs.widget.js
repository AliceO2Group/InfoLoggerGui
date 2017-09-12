
jQuery.widget('o2.logs', {
  _create: function() {
    console.log('logs created');

    if (!this.options.model) {
      throw new Error('logs widget needs a model');
    }

    this.model = this.options.model;
    this.render();
  },

  render: function() {
    const el = this.element;
    const model = this.model;
    var str = '';

    model.logs.forEach(row => {
      const classSeverity = row.severity === 'I' ? 'col-severityI' : 'col-severityF';

      str += `
        <tr>
          <td class="col-100px text-overflow text-center ${classSeverity}">${htmlEscape(row.severity)}</td>
          <td class="col-100px text-overflow text-center">${htmlEscape(row.hostname)}</td>
          <td class="col-max text-overflow" title="${htmlEscape(row.message)}"><span class="toto">${htmlEscape(row.message)}</span></td>
        </tr>
      `;
    });

    // virtual-dom should be used here to avoid losing text selection and scroll position
    $(el).find('tbody').html(str);
  }
});

