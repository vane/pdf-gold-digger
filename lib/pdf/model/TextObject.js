const PdfObject = require('./PdfObject');
const TextLine = require('./text/TextLine');

/**
 * Represents text fragment
 * with multiple lines in pdf document
 */
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

module.exports = TextObject;
