const Model = require('./model');
const Constraints = require('./Constraints');
const util = require('pdfjs-dist/lib/shared/util');

/**
 * Extracts text information from glyphs
 */
class ExtractText {
  /**
   * Return text from glyphs array
   * @param glyphs - glyphs from pdf.OPS.showText, pdf.OPS.showSpacedText
   * @param page - PdfPage object @see PdfPage
   */
  showText(glyphs, page) {
    // MOVED from VisitorText
    const el = page.currentObject.getLine();
    // -i ../../github.com/pdf.js/test/pdfs/ZapfDingbats.pdf -f text null pointer
    if(!el.getText()) {
      el.newText();
    }
    el.setFont(page.currentFont)
    const line = el.getText();
    // END
    let partial = "";
    let x = 0;
    const font = line.getFont();
    for(const glyph of glyphs) {
      if (glyph === null) {
        // Word break
        x += font.direction * line.wordSpacing;
        continue;
      } else if (util.isNum(glyph)) {
        x += -glyph * font.size * 0.001;
        if (glyph === -250) {
          partial += " ";
        }
        continue;
      }
      const spacing = (glyph.isSpace ? line.wordSpacing : 0) + line.charSpacing;
      if(spacing > 0) {
        console.warn(`Not implemented spacing : ${spacing} !`)
      }
      // TODO use glyph font character
      partial += glyph.unicode;
      const width = glyph.width;
      // const widthAdvanceScale = font.size * line.fontMatrix[0];
      const widthAdvanceScale = font.size * Constraints.FONT_IDENTITY_MATRIX[0];
      const charWidth = width * widthAdvanceScale + spacing * font.direction;
      if (!glyph.isInFont && !font.missingFile) {
        x += charWidth;
        continue;
      }
      //need global x/y position
      /*current.xcoords.push(current.x + x * textHScale);
      current.tspan.textContent += character;
      */
      page.currentObject.x += charWidth;
      if (font.vertical) {
        page.currentObject.y -= x * textHScale;
      } else {
        page.currentObject.x += x * textHScale;
      }
    }
    line.setText(partial+" ");
    el.printText();
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
   * @param page - pdf page @see PdfPage
   */
  setFont(details, page) {
    const fontObj = page.data.commonObjs.get(details[0]);
    const font = new Model.FontObject()
    font.setSize(details[1]);
    font.weight = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
      (fontObj.bold ? 'bold' : 'normal');
    font.style = fontObj.italic ? 'italic' : 'normal';
    const family = this.getFontFamily(fontObj.loadedName, page.dependencies);
    if(family) {
      font.family = family.name;
    } else {
      font.family = fontObj.loadedName;
    }
    font.vertical = fontObj.vertical;
    page.currentFont = font;
  }
}

module.exports = {
  ExtractText
}
