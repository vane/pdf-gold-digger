const v = require('./visitors');
const Model = require('./model');

const FN_TEXT = ['beginText', 'setFont', 'showText',
  'showSpacedText', 'endText', 'moveText',
  'setLeading', 'setLeadingMoveText', 'setCharSpacing',
  'setWordSpacing', 'setHScale', 'setTextMatrix',
  'setTextRise', 'setTextRenderingMode', 'nextLine'];
const FN_XOBJECT = ['paintFormXObjectBegin', 'paintFormXObjectEnd'];
const FN_IMAGE = ['paintJpegXObject', 'paintImageXObject', 'paintInlineImageXObject', 'paintImageMaskXObject'];

/**
 * Visits pdf.OPT.* methods using pdf page data
 */
class Visitor {

  /**
   * Constructor
   * @param {object} config - application configuration
   * @param data - pdf data
   * @param dependencies - pdf loaded dependencies
   */
  constructor (config, data, dependencies) {
    this.config = config;
    this.config.skip = false;
    /**
     * @type {PdfPage}
     */
    this.page = new Model.PdfPage(data, dependencies);
    /**
     * @type {VisitorText}
     */
    this.txt = new v.VisitorText(config, this.page);
    /**
     * @type {VisitorXObject}
     */
    this.xobject = new v.VisitorXObject(config, this.page);
    /**
     * @type {VisitorImage}
     */
    this.image = new v.VisitorImage(config, this.page);
  }

  /**
   * Parse incoming data learn more by checking visitor pattern
   * @param fname - function name to be visited
   * @param args - function arguments
   */
  visit(fname, args) {
    if(FN_TEXT.indexOf(fname) > -1) {
      this.txt[fname](args);
    } else if(FN_XOBJECT.indexOf(fname) > -1) {
      this.xobject[fname](args);
    } else if (FN_IMAGE.indexOf(fname) > -1) {
      this.image[fname](args);
    } else {
      console.warn(`Unimplemented operator ${fname}`);
    }
  }
}

module.exports = Visitor
