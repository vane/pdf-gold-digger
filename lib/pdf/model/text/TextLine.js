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

  setPosition(x, y) {
    if(this.x === 0) {
      this.x = x;
    }
    this.w = Math.max(this.x, x);
    if(this.y === 0) {
      this.y = y;
    }
    this.h = Math.max(this.y, y);
  }

  getText() {
    return this._textFonts[this._textFonts.length - 1]
  }

  newText() {
    const t = new TextFont();
    this._textFonts.push(t);
    return t;
  }

  popText() {
    this._textFonts.pop();
  }

  isNewLine(y) {
    return this.y !== 0 && Math.abs(y) > this.maxFontSize
  }

  setFont(font) {
    this.maxFontSize = Math.max(this.maxFontSize, font.size);
    this.getText().setFont(font);
  }

  compareFont(font1, font2) {
    return font1.equals(font2);
  }

  printText() {
    let txt = "";
    this._textFonts.forEach((el) => txt += el.getText());
    console.log(txt);
  }

  getData() {
    return this._textFonts;
  }
}

module.exports = TextLine;
