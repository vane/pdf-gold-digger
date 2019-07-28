const VisitorBase = require('./VisitorBase');

/**
 * Visits XObject data when parsing pdf
 * Currently only sets flag skip for XObjectBegin
 * @extends {VisitorBase}
 */
class VisitorXObject extends VisitorBase {
  /**
   * pdf.OPS.paintFormXObjectBegin
   */
  paintFormXObjectBegin (args) {
    if (this.config.debug) console.log('paintFormXObjectBegin');
    if (!this.config.paintFormXObject) {
      this.config.skip = true;
    }
  }

  /**
   * pdf.OPS.paintFormXObjectEnd
   */
  paintFormXObjectEnd (args) {
    if (this.config.debug) console.log('paintFormXObjectEnd');
    this.config.skip = false;
  }
}

module.exports = VisitorXObject;
