const PdfObject = require('./PdfObject');

class TextObject extends PdfObject {
  constructor() {
    super();
    this._textLines = [];
  }

  newLine() {
    const t = new TextLine();
    this._textLines.push(t);
    return t;
  }

  getLine() {
    return this._textLines[this._textLines.length -1]
  }

  getData() {
    return this._textLines;
  }
}


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

module.exports = {
  TextObject,
  TextLine,
};
