const Model = require('../model');

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
  start (doc, metadata) {
    const meta = JSON.stringify(metadata);
    return `{
      "pages_count": ${doc.numPages},
      "metadata": ${meta},
      "pages": {`;
  }

  /**
   * Formats {@link TextObject} to JSON serializable object
   * @param  {TextObject} textObject
   * @returns {object}
   */
  formatTextObject (textObject) {
    const txtObjOut = {
      lines: [],
      x: textObject.x,
      y: textObject.y,
      textMatrix: textObject.textMatrix,
    };
    const linesOut = [];
    textObject.getData().forEach(textLine => {
      const txtLineOut = this.formatTextLine(textLine);
      linesOut.push(txtLineOut);
    });
    linesOut.sort((a, b) => {
      if (a.y > b.y) return -1;
      if (a.y < b.y) return 1;
      return 0;
    });
    txtObjOut.lines = linesOut;
    return txtObjOut;
  }

  /**
   * Format image object
   * @param {ImageObject} imageObject
   */
  formatImageObject (imageObject) {
    return {
      x: imageObject.x,
      y: imageObject.y,
      width: imageObject.width,
      height: imageObject.height,
      name: imageObject.name,
    };
  }

  /**
   * Formats {@link TextLine} to JSON serializable object
   * @param {TextLine} textLine
   * @returns {object}
   */
  formatTextLine (textLine) {
    const txtLineOut = {
      text: [],
      y: textLine.y,
    };
    textLine.getText().forEach(textFont => {
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
  formatTextFont (textFont) {
    const font = textFont.font;
    return {
      font: {
        size: font.size,
        direction: font.direction,
        family: font.family,
        style: font.style,
        weight: font.weight,
        vertical: font.vertical,
      },
      x: textFont.x,
      y: textFont.y,
      end: textFont.end,
      text: textFont.getText(),
      charSpacing: textFont.charSpacing,
      wordSpacing: textFont.wordSpacing,
    };
  }

  /**
   * See {@link Formatter}
   * @param page
   * @param data
   * @param last
   * @returns {string}
   */
  format (page, data, last) {
    const txtData = [];
    data.forEach(pdfObject => {
      if (pdfObject instanceof Model.TextObject) {
        const txtObjOut = this.formatTextObject(pdfObject);
        txtData.push(txtObjOut);
      } else if (pdfObject instanceof Model.ImageObject) {
        const imgObjOut = this.formatImageObject(pdfObject);
        txtData.push(imgObjOut);
      } else {
        console.warn(`Not recognised object ${pdfObject}`);
      }
    });
    const out = JSON.stringify({
      data: txtData,
    }); // pretty print (output, null, 4)
    return `"${page.pageIndex}": ${out}${last ? '}\n' : ','}`;
  }

  /**
   * See {@link Formatter}
   * @param {array} fontData
   */
  formatFont (fontData) {
    let out = ',"fonts":{';
    Object.values(fontData).forEach(fontObj => {
      const font = fontObj.font;
      const fontJSON = JSON.stringify({
        family: font.family,
        style: font.style,
        weight: font.weight,
        file: `font/${font.file}`,
      });
      out += `"${font.family}": ${fontJSON},`;
    });
    out = out.substring(0, out.length - 1) + '}';
    return out;
  }

  /**
   * See {@link Formatter}
   * @returns {string}
   */
  end () {
    return `\n}`;
  }
}

module.exports = FormatterJSON;
