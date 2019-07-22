const FormatterJSON = require('./formatter/FormatterJSON');
const FormatterXML = require('./formatter/FormatterXML');
const FormatterText = require('./formatter/FormatterText');

class Formatter {

  constructor() {
    this.formatters = {
      json: new FormatterJSON(),
      xml: new FormatterXML(),
      text: new FormatterText(),
    }
  }

  start(format, doc, metadata) {
    const o = this.formatters[format].start(doc, metadata);
    console.log(o);
  }

  format(format, page, data, last) {
    const o = this.formatters[format].format(page, data, last);
    console.log(o);
  }

  end(format) {
    const o = this.formatters[format].end();
    console.log(o);
  }
}

module.exports = Formatter;