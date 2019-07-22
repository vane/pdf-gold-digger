const PdfObject = require('./../PdfObject');
const TextFont = require('./../text/TextFont');

/**
 * Represents text line in pdf file
 */
class TextLine extends PdfObject {
  constructor() {
    super();
    this._textFonts = [];
    this.maxFontSize = 0;
    this.w = 0;
    this.h = 0;
    this.textMatrix = null;
  }

  /**
   * Calculate TextLine size
   * @param x
   * @param y
   */
  setBBox(x, y) {
    if(this.x === 0) {
      this.x = x;
    }
    this.w = Math.max(this.x, x);
    if(this.y === 0) {
      this.y = y;
    }
    this.h = Math.max(this.y, y);
  }

  /**
   * Get last TextFont
   * @returns {TextFont}
   */
  getText() {
    return this._textFonts[this._textFonts.length - 1]
  }

  /**
   * Create new TextFont and add it to list
   * @returns {TextFont}
   */
  newText() {
    const t = new TextFont();
    this._textFonts.push(t);
    return t;
  }

  /**
   * Remove last TextFont
   */
  popText() {
    this._textFonts.pop();
  }

  /**
   * Checks if y is greater then maximal font added to this line
   * if so return true so it's new line of text
   * @param y - position in pdf document
   * @returns {boolean}
   */
  isNewLine(y) {
    return this.y !== 0 && Math.abs(y) > this.maxFontSize
  }

  /**
   * Set FontObject information in TextFont
   * @param font {FontObject} data
   */
  setFont(font) {
    this.maxFontSize = Math.max(this.maxFontSize, font.size);
    this.getText().setFont(font);
  }

  /**
   * Compare if two FontObject are equal
   * @param font1 {FontObject}
   * @param font2 {FontObject}
   * @returns {Boolean} true if equal
   */
  compareFont(font1, font2) {
    return font1.equals(font2);
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
