const Model = require('../model');

// https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
const escapeXml = (unsafe) => {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

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
      <pages>
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
    txtObjOut += '</object>\n';
    return txtObjOut;
  }

  /**
   * Format image object
   * @param {ImageObject} imageObject
   */
  formatImageObject (imageObject) {
    return `<image 
    x="${imageObject.x}" 
    y="${imageObject.y}" 
    width="${imageObject.width}" 
    height="${imageObject.height}">${imageObject.name}</image>\n`;
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
    const font = textFont.font;
    return `<text 
    size="${font.size}" 
    direction="${font.direction}"
    family="${font.family}"
    style="${font.style}"
    weight="${font.weight}"
    vertical="${font.vertical}"
    x="${textFont.x}"
    y="${textFont.y}"
    char-spacing="${textFont.charSpacing}"
    word-spacing="${textFont.wordSpacing}">${escapeXml(textFont.getText())}</text>\n`;
  }

  /**
   * See {@link Formatter}
   * @param page
   * @param data
   * @param last
   * @returns {string}
   */
  format (page, data, last) {
    let out = `<page index="${page.pageIndex}">\n`;
    data.forEach(pdfObject => {
      if (pdfObject instanceof Model.TextObject) {
        out += this.formatTextObject(pdfObject);
      } else if (pdfObject instanceof Model.ImageObject) {
        out += this.formatImageObject(pdfObject);
      } else {
        console.warn(`Not recognised object ${pdfObject}`);
      }
    });
    out += '</page>\n';
    if(last) {
      out += '</pages>'
    }
    return out;
  }

  formatFont (fontData) {
    let out = '<fonts>\n';
    Object.values(fontData).forEach(fontObj => {
      const font = fontObj.font;
      out += `<font family="${font.family}" 
size="${font.size}" 
direction="${font.direction}"
style="${font.style}"
weight="${font.weight}"
vertical="${font.vertical}">${font.family}</font>\n`;
    });
    out += '</fonts>';
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
