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
   * Formats {@link TextObject} to xml object
   * @param  {TextObject} textObject
   * @returns {object}
   */
  formatTextObject (textObject) {
    let txtObjOut = `<object x="${textObject.x}" y="${textObject.y}" matrix="${textObject.textMatrix}">\n`;
    const lines = textObject.getData();
    lines.sort((a, b) => {
      if (a.y > b.y) return -1;
      if (a.y < b.y) return 1;
      return 0;
    });
    lines.forEach(textLine => {
      txtObjOut += this.formatTextLine(textLine);
    });
    txtObjOut += '</object>';
    return txtObjOut;
  }

  /**
   * Formats {@link TextLine} to xml object
   * @param {TextLine} textLine
   * @returns {object}
   */
  formatTextLine (textLine) {
    let txtLineOut = `<line y="${textLine.y}">\n`;
    textLine.getText().forEach(textFont => {
      txtLineOut += this.formatTextFont(textFont);
    });
    txtLineOut += '</line>\n';
    return txtLineOut;
  }

  /**
   * Formats {@link TextFont} to xml object
   * @param {TextFont} textFont
   * @returns {object}
   */
  formatTextFont (textFont) {
    return `<text 
    size="${textFont.font.size}" 
    direction="${textFont.font.direction}"
    family="${textFont.font.family}"
    style="${textFont.font.style}"
    weight="${textFont.font.weight}"
    vertical="${textFont.font.vertical}"
    x="${textFont.x}"
    y="${textFont.y}"
    char-spacing="${textFont.charSpacing}"
    word-spacing="${textFont.wordSpacing}">${textFont.getText()}</text>\n`;
  }

  /**
   * See {@link Formatter}
   * @param page
   * @param data
   * @param last
   * @returns {string}
   */
  format (page, data, last) {
    let out = '<data>\n';
    data.forEach(textObject => {
      out += this.formatTextObject(textObject) + '\n';
    });
    out += '</data>';
    return out;
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
