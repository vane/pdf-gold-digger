const Extract = require('./../Extract');
const Model = require('./../model');
const VisitorBase = require('./VisitorBase');
const Geometry = require('../model/Geometry');

/**
 * Visits text data while parsing pdf
 */
class VisitorText extends VisitorBase {
  constructor(config, page, dependencies, debug, objectList) {
    super(config, page, dependencies, debug, objectList);
    this.txt = new Extract.ExtractText();
    this.currentObject;
    this.currentFont;
    this.position = new Geometry.Point();
  }

  /**
   * pdf.OPS.beginText
   */
  beginText(args) {
    if (this.debug) console.log('beginText');
    if (this.config.skip) return;
    this.currentObject = new Model.TextObject();
    // SHOULD determine if new line while extracting text cause it can begin in any time
    this.currentObject.newLine();
    this.objectList.push(this.currentObject);
  }

  /**
   * pdf.OPS.setFont
   */
  setFont(args) {
    if (this.debug) console.log('setFont');
    if (this.config.skip) return;
    this.currentFont = this.txt.getFont(args, this.page, this.dependencies)
  }

  /**
   * pdf.OPS.showText
   */
  showText(args) {
    if (this.debug) console.log("showText");
    if (this.config.skip) return;
    const el = this.currentObject.getLine();
    // -i ../../github.com/pdf.js/test/pdfs/ZapfDingbats.pdf -f text null pointer
    if(!el.getText()) {
      el.newText();
    }
    el.setFont(this.currentFont)
    const el2 = el.getText();
    // first text element workaround
    const txt = this.txt.getText(args[0], el2, this.position)+" ";
    el2.setText(txt);
  }

  /**
   * pdf.OPS.showSpacedText
   */
  showSpacedText(args) {
    if (this.debug) console.log("showSpacedText");
    if (this.config.skip) return;
    const el = this.currentObject.getLine();
    el.setFont(this.currentFont)
    const el2 = el.getText();
    // first text element workaround
    el2.setText(this.txt.getText(args[0], el2, this.position)+" ");
  }

  /**
   * pdf.OPS.endText
   */
  endText(args) {
    if (this.debug) console.log('endText');
    if (this.config.skip) return;
    this.currentObject = null;
  }

  /**
   * pdf.OPS.moveText
   */
  moveText(args) {
    if (this.debug) console.log('moveText');
    if (this.config.skip) return;
    let el = this.currentObject.getLine();
    const x = args[0], y = args[1];
    const newLine = el.isNewLine(y);
    // new line
    if(newLine) {
      el.printText();
      el = this.currentObject.newLine();
    }
    // create new text element always after new line
    const el2 = el.newText();
    el2.x = this.currentObject.x += x;
    el2.y = this.currentObject.y += y;
    // assign to calculate bounding box
    el.setBBox(this.currentObject.x, this.currentObject.y);
  }
}

module.exports = VisitorText