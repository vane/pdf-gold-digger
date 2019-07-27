/**
 * Format PDF into json data
 */
class FormatterJSON {
  /**
   * See {@link Formatter}
   * @param doc
   * @param metadata
   * @returns {string}
   */
  start(doc, metadata) {
    const meta = JSON.stringify(metadata)
    return `{
      "pages_count": ${doc.numPages},
      "metadata": ${meta},
      "pages": {
    `
  }

  /**
   * Formats {@link TextObject} to JSON serializable object
   * @param  {TextObject} textObject
   * @returns {object}
   */
  formatTextObject(textObject) {
    const txtObjOut = {
      lines: [],
      x: textObject.x,
      y: textObject.y,
      textMatrix: textObject.textMatrix,
    };
    textObject.getData().forEach(textLine => {
      const txtLineOut = this.formatTextLine(textLine);
      txtObjOut.lines.push(txtLineOut);
    });
    return txtObjOut;
  }

  /**
   * Formats {@link TextLine} to JSON serializable object
   * @param {TextLine} textLine
   * @returns {object}
   */
  formatTextLine(textLine) {
    const txtLineOut = {
      text: [],
      x: textLine.x,
      y: textLine.y,
      width: textLine.width,
    }
    textLine.getData().forEach(textFont => {
      const txtFontOut = this.formatTextFont(textFont);
      txtLineOut.text.push(txtFontOut);
    });
    return txtLineOut;
  }

  /**
   * Formats {@link TextFont} to JSON serializable object
   * @param {TextFont} textFont
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
        vertical: textFont.font.vertical,
      },
      text: textFont.getText(),
      charSpacing: textFont.charSpacing,
      wordSpacing: textFont.wordSpacing,
    }
  }

  /**
   * See {@link Formatter}
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
   * See {@link Formatter}
   * @returns {string}
   */
  end() {
    return `}
    }
    `
  }
}

module.exports = FormatterJSON;
