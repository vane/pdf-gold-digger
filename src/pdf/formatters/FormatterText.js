/**
 * Format PDF into text data
 */
class FormatterText {
  /**
   * See {@link Formatter}
   * @param doc
   * @param metadata
   * @returns {string}
   */
  start (doc, metadata) {
    return '';
  }

  /**
   * Format {@link TextObject} to string
   * @param {TextObject} textObject
   * @returns {string}
   */
  formatTextObject (textObject) {
    let txtObjOut = '';
    const lines = textObject.getData();
    lines.sort((a, b) => {
      if (a.y > b.y) return -1;
      if (a.y < b.y) return 1;
      return 0;
    });
    lines.forEach(textLine => {
      const txtLineOut = this.formatTextLine(textLine);
      console.log(txtLineOut);
      txtObjOut += txtLineOut + '\n';
    });
    return txtObjOut;
  }

  /**
   * Format {@link TextLine} to string
   * @param {TextLine} textLine
   * @returns {string}
   */
  formatTextLine (textLine) {
    let txtLineOut = '';
    textLine.getText().forEach(textFont => {
      txtLineOut += this.formatTextFont(textFont);
    });
    return txtLineOut;
  }

  /**
   * Format {@link TextFont} to string
   * @param {TextFont} textFont
   * @returns {string|TextFont|*}
   */
  formatTextFont (textFont) {
    return textFont.getText();
  }

  /**
   * See {@link Formatter}
   * @param page
   * @param data
   * @param last
   * @returns {string}
   */
  format (page, data, last) {
    let output = '';
    data.forEach(textObject => {
      const txtObjOut = this.formatTextObject(textObject);
      output += txtObjOut;
    });
    return output;
  }

  /**
   * See {@link Formatter}
   * @returns {string}
   */
  end () {
    return '';
  }
}

module.exports = FormatterText;
