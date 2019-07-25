/**
 * Format PDF into json data
 */
class FormatterJSON {
  start(doc, metadata) {
    const meta = JSON.stringify(metadata)
    return `{
      "pages_count": ${doc.numPages},
      "metadata": ${meta},
      "pages": {
    `
  }

  /**
   * Formats {TextObject} to JSON serializable object
   * @param textObject {TextObject}
   * @returns {object}
   */
  formatTextObject(textObject) {
    const txtObjOut = {lines: [], x: textObject.x, y: textObject.y};
    textObject.getData().forEach(textLine => {
      const txtLineOut = this.formatTextLine(textLine);
      txtObjOut.lines.push(txtLineOut);
    });
    return txtObjOut;
  }

  /**
   * Formats {TextLine} to JSON serializable object
   * @param textLine {TextLine}
   * @returns {object}
   */
  formatTextLine(textLine) {
    const txtLineOut = {
      text: [],
      x: textLine.x,
      y: textLine.y,
      w: textLine.w,
      h: textLine.h,
      textMatrix: textLine.textMatrix,
    }
    textLine.getData().forEach(textFont => {
      const txtFontOut = this.formatTextFont(textFont);
      txtLineOut.text.push(txtFontOut);
    });
    return txtLineOut;
  }

  /**
   * Formats {TextFont} to JSON serializable object
   * @param textFont {TextFont}
   * @returns {object}
   */
  formatTextFont(textFont) {
    return {
      font: {
        size: textFont.font.size,
        direction: textFont.font.direction,
        family: textFont.font.family,
        style: textFont.font.style,
        weight: textFont.font.weight,
      },
      text: textFont.getText(),
      charSpacing: textFont.charSpacing,
      wordSpacing: textFont.wordSpacing,
    }
  }

  /**
   * See {Formatter}
   * @param page
   * @param data
   * @param last
   * @returns {string}
   */
  format(page, data, last) {
    const txtData = [];
    data.forEach(textObject => {
      const txtObjOut = this.formatTextObject(textObject);
      txtData.push(txtObjOut);
    });
    let output = {
      "data": txtData,
    }
    const out = JSON.stringify(output)// pretty print (output, null, 4)
    return `"${page.pageIndex}": ${out}${last ? '': ','}`
  }

  /**
   * See {Formatter}
   * @returns {string}
   */
  end() {
    return `}
    }
    `
  }
}

module.exports = FormatterJSON;
