const PdfObject = require('./../PdfObject');

/**
 * Represents Font information in pdf file
 * @extends {PdfObject}
 */
class TextFont extends PdfObject {
  /**
   * Constructor
   */
  constructor () {
    super();
    this.font = null;
    this._text = '';
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this._tolerance = 5;
  }

  /**
   * Setter for text string
   * @param text {string}
   */
  setText (text) {
    if (this._text.length > 0) {
      this._text += text;
    } else {
      this._text = text;
    }
  }

  /**
   * Heuristic method to check if glyph number is space
   * @param {number} glyph - numeric size
   * @returns {boolean} - flag true if it's space false if it's not
   */
  isSpace (glyph) {
    if (-glyph >= this.font.spaceWidth) {
      return true;
    } else if (this.font.size < 10) {
      const space = this.font.spaceWidth - (10 * Math.round(this.font.size)) - this._tolerance;
      if (-glyph >= space) {
        return true;
      }
    }
    return false;
  }

  /**
   * Getter for text string
   * @returns {string}
   */
  getText () {
    return this._text;
  }
}

module.exports = TextFont;
