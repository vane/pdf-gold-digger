
class FormatterText {
  /**
   * See {Formatter}
   * @param doc
   * @param metadata
   * @returns {string}
   */
  start(doc, metadata) {
    return ''
  }

  /**
   * Format {TextObject} to string
   * @param textObject {TextObject}
   * @returns {string}
   */
  formatTextObject(textObject) {
    let txtObjOut = '';
    textObject.getData().forEach(textLine => {
      const txtLineOut = this.formatTextLine(textLine);
      txtObjOut += txtLineOut + '\n';
    });
    return txtObjOut;
  }

  /**
   * Format {TextLine} to string
   * @param textLine
   * @returns {string}
   */
  formatTextLine(textLine) {
    let txtLineOut = '';
    textLine.getData().forEach(textFont => {
      txtLineOut += this.formatTextFont(textFont);
    });
    return txtLineOut;
  }

  /**
   * Format {TextFont} to string
   * @param textFont {TextFont}
   * @returns {string|TextFont|*}
   */
  formatTextFont(textFont) {
    return textFont.getText();
  }

  /**
   * See {Formatter}
   * @param page
   * @param data
   * @param last
   * @returns {string}
   */
  format(page, data, last) {
    let output = '';
    data.forEach(textObject => {
      const txtObjOut = this.formatTextObject(textObject);
      output += txtObjOut;
    });
    return output;
  }

  /**
   * See {Formatter}
   * @returns {string}
   */
  end() {
    return ''
  }

}

module.exports = FormatterText;
