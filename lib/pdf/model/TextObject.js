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

  /**
   * Create new {TextLine} adds it to array and returns it as value
   * @returns {TextLine}
   */
  newLine() {
    const t = new TextLine();
    this._textLines.push(t);
    return t;
  }

  /**
   * Return last {TextLine} from text array
   * @returns {TextLine}
   */
  getLine() {
    return this._textLines[this._textLines.length -1]
  }

  /**
   * Return array of {TextLine}
   * @returns {Array}
   */
  getData() {
    return this._textLines;
  }
}

module.exports = TextObject;
