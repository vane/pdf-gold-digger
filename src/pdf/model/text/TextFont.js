const PdfObject = require('./../PdfObject');

/**
 * Represents Font information in pdf file
 */
class TextFont extends PdfObject {
  constructor() {
    super();
    this._font = null;
    this._text = "";
    this.charSpacing = 0;
    this.wordSpacing = 0;
  }

  /**
   * Getter for {FontObject}
   * @returns {null|FontObject}
   */
  getFont() {
    return this._font;
  }

  /**
   * Setter for {FontObject}
   * @param font {FontObject}
   */
  setFont(font) {
    this._font = font;
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