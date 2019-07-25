const PdfObject = require('./../PdfObject');
const TextFont = require('./../text/TextFont');

/**
 * Represents text line in pdf file
 */
class TextLine extends PdfObject {
  constructor() {
    super();
    this._textFonts = [];
    this.width = 0;
    this.height = 0;
  }

  /**
   * Adds line with font to text
   * @param line @see {TextFont}
   */
  addTextFont(line) {
    this._textFonts.push(line);
  }

  /**
   * Get last TextFont
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
   * Get Array of all {TextFont} data inside this text line
   * @returns {Array} of {TextFont}
   */
  getData() {
    return this._textFonts;
  }
}

module.exports = TextLine;
