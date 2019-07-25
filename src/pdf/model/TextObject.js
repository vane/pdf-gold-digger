const util = require('pdfjs-dist/lib/shared/util');
const Constraints = require('../Constraints');
const PdfObject = require('./PdfObject');
const TextLine = require('./text/TextLine');

/**
 * Represents text fragment
 * with multiple lines in pdf document
 */
class TextObject extends PdfObject {
  constructor() {
    super();
    this.textMatrix = Constraints.IDENTITY_MATRIX;
    this.textRenderingMode = util.TextRenderingMode.FILL;
    this.lineMatrix = Constraints.IDENTITY_MATRIX;
    this.textMatrixScale = 1;
    this._textLines = [];
  }

  /**
   * Create new {@link TextLine} adds it to array and returns it as value
   * @returns {TextLine}
   */
  newLine() {
    const t = new TextLine();
    this._textLines.push(t);
    return t;
  }

  /**
   * Return last {@link TextLine} from text array
   * @returns {TextLine}
   */
  getLine() {
    return this._textLines[this._textLines.length -1]
  }

  /**
   * Return array of {@link TextLine}
   * @returns {Array}
   */
  getData() {
    return this._textLines;
  }
}

module.exports = TextObject;
