const PdfObject = require('./../PdfObject');

/**
 * Represents text line in pdf file
 * @extends {PdfObject}
 */
class TextLine extends PdfObject {
  /**
   * Constructor
   */
  constructor () {
    super();
    this._textFonts = [];
  }

  /**
   * Adds line with font to text
   * @param {TextFont} line
   */
  addTextFont (line) {
    this._textFonts.push(line);
  }

  /**
   * Get last {@link TextFont}
   * @returns {TextFont}
   */
  getLastFontText () {
    if (this._textFonts.length > 0) {
      return this._textFonts[this._textFonts.length - 1];
    }
    return null;
  }

  /**
   * Output line text to the console
   */
  printText () {
    let txt = '';
    this._textFonts.forEach((el) => { txt += el.getText(); });
    console.log(txt);
  }

  /**
   * Get Array of all {@link TextFont} data inside this text line
   * @returns {Array} of {@link TextFont}
   */
  getText () {
    return this._textFonts.slice();
  }
}

module.exports = TextLine;
