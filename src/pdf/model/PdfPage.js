const PdfObject = require('./PdfObject');

/**
 * Holds PDF page information
 * @extends {PdfObject}
 */
class PdfPage extends PdfObject {
  /**
   * Constructor
   * @param {object} data - pdf page data opcodes
   * @param {object} dependencies - pdf loaded resources
   */
  constructor (data, dependencies) {
    super();
    this.data = data;
    this.dependencies = dependencies;
    this.objectList = [];
    // font
    this.leading = 0;

    this.textMatrixScale = 1;

    // Character and word spacing
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRise = 0;
    
    this.currentObject;
    this.currentFont;
  }

  /**
   * Set current object and add it to objectList
   * @param {TextObject} obj
   */
  setCurrentObject(obj) {
    this.currentObject = obj
    this.objectList.push(obj);
  }
}

module.exports = PdfPage;
