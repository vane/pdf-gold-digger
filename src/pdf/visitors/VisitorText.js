const Extract = require('./../Extract');
const Model = require('./../model');
const VisitorBase = require('./VisitorBase');

/**
 * Visits text data while parsing pdf
 * @extends {VisitorBase}
 */
class VisitorText extends VisitorBase {
  constructor (config, page) {
    super(config, page);
    this.txt = new Extract.ExtractText();
  }

  /**
   * pdf.OPS.beginText
   */
  beginText (args) {
    if (this.config.debug) console.log('beginText');
    if (this.config.skip) return;
    if (!this.page.currentObject || !('textMatrixScale' in this.page.currentObject)) {
      this.page.setCurrentObject(new Model.TextObject());
      // SHOULD determine if new line while extracting text cause it can begin in any time
      this.page.currentObject.newLine();
    }
  }

  /**
   * pdf.OPS.setLeading
   */
  setLeading (args) {
    if (this.config.debug) console.log('setLeading');
    if (this.config.skip) return;
    this.page.leading = -args[0];
  }

  /**
   * pdf.OPS.setLeadingMoveText
   */
  setLeadingMoveText (args) {
    if (this.config.debug) console.log('setLeadingMoveText');
    if (this.config.skip) return;
    const x = args[0];
    const y = args[1];
    this.page.leading = -y;
    this.moveText(x, y);
  }

  /**
   * pdf.OPS.setFont
   */
  setFont (args) {
    if (this.config.debug) console.log('setFont');
    if (this.config.skip) return;
    this.txt.setFont(args, this.page);
  }

  /**
   * pdf.OPS.showText
   */
  showText (args) {
    if (this.config.debug) console.log('showText');
    if (this.config.skip) return;
    this.txt.showText(args[0], this.page);
  }

  /**
   * pdf.OPS.showSpacedText
   */
  showSpacedText (args) {
    if (this.config.debug) console.log('showSpacedText');
    if (this.config.skip) return;
    this.txt.setText(args[0], this.page);
  }

  /**
   * pdf.OPS.moveText
   */
  moveText (args) {
    if (this.config.debug) console.log('moveText');
    if (this.config.skip) return;
    if (this.page.x === 0 && this.page.y === 0) {
      this.page.x = args[0];
      this.page.y = args[1];
    } else {
      this.page.x = args[0];
      this.page.y += args[1];
    }
  }

  /**
   * pdf.OPS.endText
   */
  endText (args) {
    if (this.config.debug) console.log('endText');
    // if (this.config.skip) return;
  }

  /**
   * pdf.OPS.setCharSpacing
   */
  setCharSpacing (args) {
    if (this.config.debug) console.log('setCharSpacing');
    // if (this.config.skip) return;
  }

  /**
   * pdf.OPS.setWordSpacing
   */
  setWordSpacing (args) {
    if (this.debug) console.log('setWordSpacing');
    // if (this.config.skip) return;
  }

  /**
   * pdf.OPS.setHScale
   */
  setHScale (args) {
    if (this.config.debug) console.log('setHScale');
    // if (this.config.skip) return;
  }

  /**
   * pdf.OPS.setTextMatrix
   */
  setTextMatrix (args) {
    if (this.config.debug) console.log('setWordSpacing');
    if (this.config.skip) return;
    const a = args[0];
    const b = args[1];
    const c = args[2];
    const d = args[3];
    const e = args[4];
    const f = args[5];
    this.page.currentObject.textMatrix = this.page.currentObject.lineMatrix = [a, b, c, d, e, f];
    this.page.x = e;
    this.page.y = f;
  }

  /**
   * pdf.OPS.setTextRise
   */
  setTextRise (args) {
    if (this.config.debug) console.log('setTextRise');
    // if (this.config.skip) return;
  }

  /**
   * pdf.OPS.setTextRenderingMode
   */
  setTextRenderingMode (args) {
    if (this.config.debug) console.log('setTextRenderingMode');
    // if (this.config.skip) return;
  }

  /**
   * pdf.OPS.nextLine
   */
  nextLine (args) {
    if (this.config.debug) console.log('nextLine');
    // if (this.config.skip) return;
  }
}

module.exports = VisitorText;
