const Model = require('./model');
const Constraints = require('./Constraints');
const util = require('pdfjs-dist/lib/shared/util');
const opentype = require('opentype.js');

const FONT_CACHE = {};

const KNOWN_STYLES_MAP = {
  Regular: 'normal',
  Normal: 'normal',
  Unknown: 'normal',
  Bold: 'bold',
  Italic: 'italic',
  'Bold Italic': 'bold_italic',
};

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
      // TODO add optional recogniser based on glyph draw path ex tesseract.js
      //if(line.font.opentype) {
      //  const p = line.font.opentype.getPath(glyph.fontChar);
      //  console.log(p);
      // } else {
      partial += glyph.unicode;
      //}
      const width = glyph.width;
      // const widthAdvanceScale = font.size * line.fontMatrix[0];
      const widthAdvanceScale = line.font.size * Constraints.FONT_IDENTITY_MATRIX[0];
      const charWidth = width * widthAdvanceScale + spacing * line.font.direction;
      if (!glyph.isInFont && !line.font.missingFile) {
        x += charWidth;
        continue;
      }
      x += charWidth;
      // line.x = page.x += charWidth;
    }
    line.x = page.x;
    line.y = page.y;
    if (line.font.vertical) {
      page.y -= x * page.textHScale;
      line.end = page.y;
    } else {
      page.x += x * page.textHScale;
      line.end = page.x;
    }
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
      const extension = 'ttf';
      const fname = `${fontObj.name}.${extension}`;
      page.fonts[fontObj.name] = {
        fname,
        name: fontObj.name,
        missingFile: fontObj.missingFile, // sometimes we miss font inside single page but it's present in another page
        data: fontObj.data,
        type: fontObj.type,
        mimetype: fontObj.mimetype,
        loadedName: fontObj.loadedName,
      };
    }
    // calculate space width
    let spaceKey = -1;
    if (fontObj.toUnicode) {
      for (const key in fontObj.toUnicode._map) {
        if (fontObj.toUnicode._map[key] === ' ') {
          spaceKey = key;
          break;
        }
      }
    }
    if (spaceKey > -1 && fontObj.widths[spaceKey]) {
      font.spaceWidthIsSet = true;
      font.spaceWidth = fontObj.widths[spaceKey];
    }
    font.loadedName = fontObj.loadedName;
    font.setSize(details[1]);
    font.weight = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') : (fontObj.bold ? 'bold' : 'normal');
    font.style = fontObj.italic ? 'italic' : 'normal';
    const family = this.getFontFamily(fontObj.loadedName, page.dependencies);
    if (family) {
      font.family = family.name;
    } else {
      font.family = fontObj.loadedName;
    }
    font.vertical = fontObj.vertical || false;
    font.obj = fontObj;
    this.parseFont(fontObj, font);
    page.currentFont = font;
  }

  /**
   * Load font using opentype.js and get font information like style weight based on font data
   * @param {object} fontObj
   * @param {FontObject} font
   */
  parseFont (fontObj, font) {
    let fontLoaded = null;
    // load font
    if (!(fontObj.loadedName in FONT_CACHE)) {
      if (!fontObj.missingFile && fontObj.data) {
        fontLoaded = opentype.parse(fontObj.data.buffer);
        FONT_CACHE[fontObj.loadedName] = { loaded: fontLoaded };
      }
    } else {
      fontLoaded = FONT_CACHE[fontObj.loadedName].loaded;
    }
    // get font information
    if (fontLoaded) {
      const subFamily = fontLoaded.names.fontSubfamily;
      const subFamilyArray = Object.keys(subFamily);
      let style = subFamily[subFamilyArray[0]];
      if(subFamilyArray.length > 1) {
        console.warn(`More then one styles ${subFamilyArray}, picking first one.`)
      }
      if (style in KNOWN_STYLES_MAP) {
        style = KNOWN_STYLES_MAP[style];
      } else {
        console.log('implement');
      }
      if (style === 'normal') {
        font.weight = 'normal';
      } else if (style === 'bold') {
        font.weight = 'bold';
      } else if (style === 'italic') {
        font.style = 'italic';
      } else if (style === 'bold_italic') {
        font.style = 'italic';
        font.weight = 'bold';
      }
      font.opentype = fontLoaded;
      FONT_CACHE[fontObj.loadedName].font = font;
    }
  }
}

module.exports = {
  ExtractText,
  FONT_CACHE,
};
