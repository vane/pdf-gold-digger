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

  getFont() {
    return this._font;
  }

  setFont(font) {
    this._font = font;
  }

  setText(text) {
    this._text = text;
  }

  getText() {
    return this._text;
  }

  equals(font) {
    return this.font === font.font
      && this.charSpacing === font.charSpacing
      && this.wordSpacing === font.wordSpacing;
  }
}

module.exports = TextFont;