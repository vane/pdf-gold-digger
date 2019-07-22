const FontObject = require('./FontObject');
const Constraints = require('./Constraints');

/**
 * Extracts text information from glyphs
 */
class ExtractText {
  /**
   * Return text from glyphs array
   * @param glyphs - glyphs from pdf.OPS.showText, pdf.OPS.showSpacedText
   * @param line - TextLine
   * @returns {string} extracted text
   */
  getText(glyphs, line) {
    let partial = "";
    let x = 0;
    const font = line.getFont();
    for(const glyph of glyphs) {
      if (glyph === null) {
        // Word break
        x += font.direction * line.wordSpacing;
        continue;
      } else if (this.isNum(glyph)) {
        x += -glyph * font.size * 0.001;
        if (glyph < 0) {
          partial += " ";
        }
        continue;
      }
      const spacing = (glyph.isSpace ? line.wordSpacing : 0) + line.charSpacing;
      if(spacing > 0) {
        throw Error("Not implemented !")
      }
      partial += glyph.unicode;
      const width = glyph.width;
      // const widthAdvanceScale = font.size * line.fontMatrix[0];
      const widthAdvanceScale = font.size * Constraints.FONT_IDENTITY_MATRIX[0];
      const charWidth = width * widthAdvanceScale + spacing * font.direction;
      x += charWidth;
    }
    return partial;
  }

  /**
   * Find font family inside loadedDependencies based on font name
   * @param name - font name
   * @param dependencies - pdf document data
   * @returns {*} font from dependencies if found otherwise null
   * (probably need to warn user for missing font inside document)
   */
  getFontFamily(name, dependencies) {
    for(let i = 0;i<dependencies.length;i++) {
      if(dependencies[i].loadedName == name) {
        return dependencies[i]
      }
    }
    return null;
  }

  /**
   * Gets FontObject from page information when pdf.OPS.setFont
   * @param details - arguments from pdf.OPS.setFont
   * @param page current pdf page
   * @param dependencies - loaded font information
   * @returns {FontObject} parsed font information
   */
  getFont(details, page, dependencies) {
    const fontObj = page.commonObjs.get(details[0]);
    const font = new FontObject()
    font.setSize(details[1]);
    font.weight = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
      (fontObj.bold ? 'bold' : 'normal');
    font.style = fontObj.italic ? 'italic' : 'normal';
    const family = this.getFontFamily(fontObj.loadedName, dependencies);
    if(family) {
      font.family = family.name;
    } else {
      font.family = fontObj.loadedName;
    }
    return font;
  }

  /**
   * Checks if v is number
   * see pdf.js/shared/util.js isNum
   * @param v number value
   * @returns {boolean} true if it's number
   */
  isNum(v) {
    return typeof v === 'number';
  }
}

module.exports = {
  ExtractText
}
