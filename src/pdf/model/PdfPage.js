const PdfObject = require('./PdfObject');

class PdfPage extends PdfObject {
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

  setCurrentObject(obj) {
    this.currentObject = obj
    this.objectList.push(obj);
  }
}

module.exports = PdfPage;
