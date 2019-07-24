const Extract = require('./../Extract');
const Model = require('./../model');
const VisitorBase = require('./VisitorBase');
const Geometry = require('../model/Geometry');

/**
 * Visits text data while parsing pdf
 */
class VisitorText extends VisitorBase {
  constructor(config, pageData, dependencies, objectList, page) {
    super(config, pageData, dependencies, objectList);
    this.page = page;
    this.txt = new Extract.ExtractText();
    this.currentObject;
    this.currentFont;
  }

  /**
   * pdf.OPS.beginText
   */
  beginText(args) {
    if (this.config.debug) console.log('beginText');
    if (this.config.skip) return;
    this.currentObject = new Model.TextObject();
    // SHOULD determine if new line while extracting text cause it can begin in any time
    this.currentObject.newLine();
    this.objectList.push(this.currentObject);
  }

  /**
   * pdf.OPS.setLeading
   */
  setLeading(args) {
    if (this.config.debug) console.log('setLeading');
    if (this.config.skip) return;
    this.page.leading = -args[0];
  }

  /**
   * pdf.OPS.setLeadingMoveText
   */
  setLeadingMoveText(args) {
    if(debug) console.log('setLeadingMoveText');
    if (this.config.skip) return;
    const x = args[0], y = args[1];
    this.page.leading = -y;
    this.moveText(x, y);
  }

  /**
   * pdf.OPS.setFont
   */
  setFont(args) {
    if (this.config.debug) console.log('setFont');
    if (this.config.skip) return;
    this.currentFont = this.txt.getFont(args, this.pageData, this.dependencies)
  }

  /**
   * pdf.OPS.showText
   */
  showText(args) {
    if (this.config.debug) console.log("showText");
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
    if (this.config.debug) console.log("showSpacedText");
    if (this.config.skip) return;
    const el = this.currentObject.getLine();
    el.setFont(this.currentFont)
    const el2 = el.getText();
    // first text element workaround
    el2.setText(this.txt.getText(args[0], el2, this.position)+" ");
  }

  /**
   * pdf.OPS.moveText
   */
  moveText(args) {
    if (this.config.debug) console.log('moveText');
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

  /**
   * pdf.OPS.endText
   */
  endText(args) {
    if (this.debug) console.log('endText');
    if (this.config.skip) return;
    this.currentObject = null;
  }

  /**
   * pdf.OPS.setCharSpacing
   */
  setCharSpacing(args) {
    if (this.debug) console.log('setCharSpacing');
    if (this.config.skip) return;
  }

  /**
   * pdf.OPS.setWordSpacing
   */
  setWordSpacing(args) {
    if (this.debug) console.log('setWordSpacing');
    if (this.config.skip) return;
  }

  /**
   * pdf.OPS.setHScale
   */
  setHScale(args) {
    if (this.debug) console.log('setHScale');
    if (this.config.skip) return;
  }

  /**
   * pdf.OPS.setTextMatrix
   */
  setTextMatrix(args) {
    if (this.debug) console.log('setWordSpacing');
    if (this.config.skip) return;
    const a = args[0], b = args[1], c = args[2], d = args[3], e = args[4], f = args[5];
    this.currentObject.textMatrix = this.currentObject.lineMatrix = [a, b, c, d, e, f];
  }

  /**
   * pdf.OPS.setTextRise
   */
  setTextRise(args) {
    if (this.debug) console.log('setTextRise');
    if (this.config.skip) return;
  }

  setTextRenderingMode(args) {
    if (this.debug) console.log('setTextRenderingMode');
    if (this.config.skip) return;
  }

  /**
   * pdf.OPS.nextLine
   */
  nextLine(args) {
    if (this.debug) console.log('nextLine');
    if (this.config.skip) return;
  }
}

module.exports = VisitorText