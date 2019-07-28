/**
 * Format PDF into xml data
 */
class FormatterXML {
  /**
   * See {@link Formatter}
   * @param doc
   * @param metadata
   * @returns {string}
   */
  start (doc, metadata) {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <document>
    `;
  }

  /**
   * See {@link Formatter}
   * @param page
   * @param data
   * @param last
   * @returns {string}
   */
  format (page, data, last) {
    const output = '';
    return output;
  }

  /**
   * See {@link Formatter}
   * @returns {string}
   */
  end () {
    return '</document>';
  }
}

module.exports = FormatterXML;
