const v = require('./visitor/index');
const Model = require('./model');

const FN_TEXT = ['beginText', 'setFont', 'showText',
  'showSpacedText', 'endText', 'moveText',
  'setLeading', 'setLeadingMoveText', 'setCharSpacing',
  'setWordSpacing', 'setHScale', 'setTextMatrix',
  'setTextRise', 'setTextRenderingMode', 'nextLine'];
const FN_XOBJECT = ['setTextMatrix', 'paintFormXObjectBegin', 'paintFormXObjectEnd'];
const FN_IMAGE = ['paintJpegXObject', 'paintImageXObject', 'paintInlineImageXObject', 'paintImageMaskXObject'];

/**
 * Visits pdf.OPT.* methods using pdf page data
 */
class Visitor {

  constructor (config, data, dependencies) {
    this.config = config;
    this.config.skip = false;
    this.page = new Model.PdfPage(data, dependencies);
    this.txt = new v.VisitorText(config, this.page);
    this.xobject = new v.VisitorXObject(config, this.page);
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
