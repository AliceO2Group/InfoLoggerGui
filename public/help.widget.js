jQuery.widget('o2.help', {
  _create: function() {
    if (!this.options.model) {
      throw new Error('help widget needs a model');
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
  },

  // Minimal markdown (headers, lists and paragraph)
  // For more options, it's better to use a complete lib
  _markdownToHTML(md) {
    return md
      .replace(/(#+)(.*)/g, header)
      .replace(/\n\*(.*)/g, ulList)
      .replace(/\n([^\n]+)\n/g, para);

    function header(text, chars, content) {
      var level = chars.length;
      return '<h' + level + '>' + content.trim() + '</h' + level + '>';
    }

    function ulList(text, item) {
      return `\n<ul>\n\t<li>${item.trim()}</li>\n</ul>`;
    }

    function para(text, line) {
      const trimmed = line.trim();
      if (/^<\/?(ul|ol|li|h|p|bl)/i.test(trimmed)) {
        return `\n${line}\n`;
      }
      return `\n<p>${trimmed}</p>\n`;
    }
  },

  render: function() {
    morphdom(this.el,
      this.model.help()
      ? `<div id="help" class="modal modal-help">
          <button type="button" class="modal-close" onclick="app.help(false)">×</button>
          <div class="modal-content">
            ${this._markdownToHTML(appConfig.helpMarkdown)}
          </div>
        </div>`
      : `<div id="help"></div>`
    );
  }
});
