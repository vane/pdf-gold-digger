const PdfObject = require('./../PdfObject');
const TextFont = require('./../text/TextFont');

/**
 * Represents text line in pdf file
 * @extends {PdfObject}
 */
class TextLine extends PdfObject {
  constructor() {
    super();
    this._textFonts = [];
    this.width = 0;
  }
  /**
   * Adds line with font to text
   * @param {TextFont} line
   */
  addTextFont(line) {
    this._textFonts.push(line);
  }

  /**
   * Get last {@link TextFont}
   * @returns {TextFont}
   */
  getLastFontText() {
    if(this._textFonts.length > 0) {
      return this._textFonts[this._textFonts.length - 1]
    }
    return null
  }
  /**
   * Output line text to the console
   */
  printText() {
    let txt = "";
    this._textFonts.forEach((el) => txt += el.getText());
    console.log(txt);
  }

  /**
   * Get Array of all {@link TextFont} data inside this text line
   * @returns {Array} of {@link TextFont}
   */
  getData() {
    // this._textFonts.sort((a, b) => a.x >= b.x);
    this.x = this._textFonts[0].x;
    this.width = this._textFonts[this._textFonts.length - 1].x - this.x;
    return this._textFonts;
  }
}

module.exports = TextLine;
