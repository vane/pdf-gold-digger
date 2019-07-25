const PdfObject = require('./../PdfObject');

/**
 * Represents Font information in pdf file
 */
class TextFont extends PdfObject {
  constructor() {
    super();
    this.font = null;
    this._text = "";
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this._tolerance = 5;
  }

  /**
   * Setter for text string
   * @param text {string}
   */
  setText(text) {
    if(this._text.length > 0) {
      this._text += text;
    } else {
      this._text = text;
    }
  }

  isSpace(glyph) {
    if(-glyph >= this.font.spaceWidth) {
      return true;
    } else if(this.font.size < 10) {
      const space = this.font.spaceWidth - (10 * Math.round(this.font.size)) - this._tolerance;
      if(-glyph >= space) {
        return true;
      }
    }
    return false;
  }

  /**
   * Getter for text string
   * @returns {string}
   */
  getText() {
    return this._text;
  }

  /**
   * Check if provided {FontObject} is equal to existing one
   * @param font {FontObject}
   * @returns {boolean}
   */
  equals(font) {
    return this.font === font.font
      && this.charSpacing === font.charSpacing
      && this.wordSpacing === font.wordSpacing;
  }
}

module.exports = TextFont;