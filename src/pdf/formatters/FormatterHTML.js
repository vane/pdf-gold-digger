const Model = require('../model');

/**
 * Format PDF into html data
 */
class FormatterHTML {
  /**
   * See {@link Formatter}
   * @param doc
   * @param metadata
   * @returns {string}
   */
  start (doc, metadata) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${metadata['Title'] ? metadata['Title'] : 'pdf-gold-digger - pdf to html'}</title>
</head>
<body>
    `;
  }

  /**
   * Formats {@link TextObject} to xml object
   * @param  {TextObject} textObject
   * @returns {object}
   */
  formatTextObject (textObject) {
    let txtObjOut = `<div>\n`;
    const lines = textObject.getData();
    lines.sort((a, b) => {
      if (a.y > b.y) return -1;
      if (a.y < b.y) return 1;
      return 0;
    });
    lines.forEach(textLine => {
      txtObjOut += this.formatTextLine(textLine);
    });
    txtObjOut += '</div>\n';
    return txtObjOut;
  }

  /**
   * Format image object
   * @param {ImageObject} imageObject
   */
  formatImageObject (imageObject) {
    return `<img class="pdf-dig-img" 
width="${imageObject.width}px" 
height="${imageObject.height}px" 
src="img/${imageObject.name}"/>\n`;
  }

  /**
   * Formats {@link TextLine} to xml object
   * @param {TextLine} textLine
   * @returns {object}
   */
  formatTextLine (textLine) {
    let txtLineOut = `<p class="pdfdig-text-line">`;
    textLine.getText().forEach(textFont => {
      txtLineOut += this.formatTextFont(textFont);
    });
    txtLineOut += '</p>\n';
    return txtLineOut;
  }

  /**
   * Formats {@link TextFont} to xml object
   * @param {TextFont} textFont
   * @returns {object}
   */
  formatTextFont (textFont) {
    return `<span class="pdfdig-text-font" style="font-family: ${textFont.font.family};
font-size:${textFont.font.size}pt;
font-weight:${textFont.font.weight};">
${textFont.getText()}
</span>`;
  }

  /**
   * See {@link Formatter}
   * @param page
   * @param data
   * @param last
   * @returns {string}
   */
  format (page, data, last) {
    let out = '<div class="pdfdig-pdf-object">\n';
    data.forEach(pdfObject => {
      if (pdfObject instanceof Model.TextObject) {
        out += this.formatTextObject(pdfObject);
      } else if (pdfObject instanceof Model.ImageObject) {
        out += this.formatImageObject(pdfObject);
      } else {
        console.warn(`Not recognised object ${pdfObject}`);
      }
    });
    out += '</div>';
    return out;
  }

  /**
   * See {@link Formatter}
   * @returns {string}
   */
  end () {
    return `</body>
</html>`;
  }
}

module.exports = FormatterHTML;
