const FormatterJSON = require('./formatter/FormatterJSON');
const FormatterXML = require('./formatter/FormatterXML');
const FormatterText = require('./formatter/FormatterText');

/**
 * Formats PDF to desired output
 */
class Formatter {

  constructor(config) {
    this.debug = config.debug;
    this.formatters = {
      json: new FormatterJSON(),
      xml: new FormatterXML(),
      text: new FormatterText(),
    }
    this.data = "";
  }

  /**
   * Start of formatting
   * @param format - provided by command line parameter ex.text
   * @param doc - pdf document
   * @param metadata - pdf document metadata
   */
  start(format, doc, metadata) {
    const o = this.formatters[format].start(doc, metadata);
    this.data += o;
    if (this.debug) console.log(o);
  }

  /**
   * Format pdf document page
   * @param format - provided by command line parameter ex.text
   * @param page - pdf page
   * @param data - array of {PdfObject} to format
   * @param last - is this page last page (useful for json formatting)
   */
  format(format, page, data, last) {
    const o = this.formatters[format].format(page, data, last);
    this.data += o;
    if (this.debug) console.log(o);
  }

  /**
   * End of formatting
   * @param format - provided by command line parameter ex.text
   */
  end(format) {
    const o = this.formatters[format].end();
    this.data += o;
    if (this.debug) console.log(o);
  }
}

module.exports = Formatter;