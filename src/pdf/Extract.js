const Model = require('./model');
const Constraints = require('./Constraints');
const util = require('pdfjs-dist/lib/shared/util');

/**
 * Extracts text information from glyphs
 */
class ExtractText {
  /**
   * Return text from glyphs array
   * @param {array} glyphs - glyphs from pdf.OPS.showText, pdf.OPS.showSpacedText
   * @param {PdfPage} page - pdf page object
   */
  showText (glyphs, page) {
    // MOVED from VisitorText
    let lineList = page.currentObject.getLine();
    // -i ../../github.com/pdf.js/test/pdfs/ZapfDingbats.pdf -f text null pointer
    const line = new Model.TextFont();
    line.font = page.currentFont;
    // copy from previous line
    const lastLine = lineList.getLastFontText();
    if (lastLine) {
      line.wordSpacing = lastLine.wordSpacing;
      line.charSpacing = lastLine.charSpacing;
    }
    const startY = page.y;
    // END
    let partial = '';
    let x = 0;
    for (const glyph of glyphs) {
      if (glyph === null) {
        // Word break
        x += line.font.direction * line.wordSpacing;
        continue;
      } else if (util.isNum(glyph)) {
        x += -glyph * line.font.size * 0.001;
        if (!line.font.spaceWidthIsSet && line.isSpace(glyph)) {
          partial += ' ';
        }
        continue;
      }
      const spacing = (glyph.isSpace ? line.wordSpacing : 0) + line.charSpacing;
      if (spacing > 0) {
        console.warn(`Not implemented spacing : ${spacing} !`);
      }
      // TODO use glyph font character
      partial += glyph.unicode;
      const width = glyph.width;
      // const widthAdvanceScale = font.size * line.fontMatrix[0];
      const widthAdvanceScale = line.font.size * Constraints.FONT_IDENTITY_MATRIX[0];
      const charWidth = width * widthAdvanceScale + spacing * line.font.direction;
      if (!glyph.isInFont && !line.font.missingFile) {
        x += charWidth;
        continue;
      }
      line.x = page.x += charWidth;
      if (line.font.vertical) {
        page.y -= x * page.textHScale;
      } else {
        page.x += x * page.textHScale;
      }
    }
    line.x = page.x;
    line.y = page.y;
    line.setText(partial);
    const isNew = lineList.y !== 0 && Math.abs(line.y - lineList.y) > line.font.size;
    if (isNew) {
      // lineList.printText();
      lineList = page.currentObject.newLine();
    }
    lineList.y = startY;
    lineList.addTextFont(line);
  }

  /**
   * Find font family inside loadedDependencies based on font name
   * @param {string} name - font name
   * @param dependencies - pdf document data
   * @returns {*} font from dependencies if found otherwise null
   * (probably need to warn user for missing font inside document)
   */
  getFontFamily (name, dependencies) {
    for (let i = 0; i < dependencies.length; i++) {
      if (dependencies[i].loadedName === name) {
        return dependencies[i];
      }
    }
    return null;
  }

  /**
   * Gets {@link FontObject} from page information when pdf.OPS.setFont
   * @param details - arguments from pdf.OPS.setFont
   * @param {PdfPage} page - pdf page
   */
  setFont (details, page) {
    const fontObj = page.data.commonObjs.get(details[0]);
    const font = new Model.FontObject();
    // add font to page object
    if (!(fontObj.name in page.fonts)) {
      page.fonts[fontObj.name] = {
        missingFile: fontObj.missingFile, // sometimes we miss font inside single page but it's present in another page
        data: fontObj.data,
        type: fontObj.type,
        mimetype: fontObj.mimetype,
      };
    }
    // calculate space width
    let spaceKey = -1;
    for (const key in fontObj.toUnicode._map) {
      if (fontObj.toUnicode._map[key] === ' ') {
        spaceKey = key;
        break;
      }
    }
    if (spaceKey > -1 && fontObj.widths[spaceKey]) {
      font.spaceWidthIsSet = true;
      font.spaceWidth = fontObj.widths[spaceKey];
    }
    font.setSize(details[1]);
    font.weight = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') : (fontObj.bold ? 'bold' : 'normal');
    font.style = fontObj.italic ? 'italic' : 'normal';
    const family = this.getFontFamily(fontObj.loadedName, page.dependencies);
    if (family) {
      font.family = family.name;
    } else {
      font.family = fontObj.loadedName;
    }
    font.vertical = fontObj.vertical;
    page.currentFont = font;
  }
}

module.exports = {
  ExtractText,
};
