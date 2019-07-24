const PdfObject = require('./PdfObject');

class PdfPage extends PdfObject {
  constructor () {
    super();
    this.fontSizeScale = 1;
    this.fontWeight = 'normal';
    this.fontSize = 0;
    this.leading = 0;

    this.textMatrixScale = 1;

    // Character and word spacing
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRise = 0;
  }
}

module.exports = PdfPage;
