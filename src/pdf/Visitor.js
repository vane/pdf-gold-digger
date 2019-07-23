const VisitorText = require('./visitor/VisitorText');
const VisitorXObject = require('./visitor/VisitorXObject');
const VisitorImage = require('./visitor/VisitorImage');

const FN_TEXT = ['beginText', 'setFont', 'showText', 'showSpacedText', 'endText', 'moveText'];
const FN_XOBJECT = ['setTextMatrix', 'paintFormXObjectBegin', 'paintFormXObjectEnd'];
const FN_IMAGE = ['paintJpegXObject', 'paintImageXObject', 'paintInlineImageXObject', 'paintImageMaskXObject'];

/**
 * Visits pdf.OPT.* methods using pdf page data
 */
class Visitor {

  constructor (config, debug) {
    this.objectList = [];
    this.config = config;
    this.config.skip = false;
    this.txt = new VisitorText(config, debug, this.objectList);
    this.xobject = new VisitorXObject(config, debug, this.objectList);
    this.image = new VisitorImage(config, debug, this.objectList);
    this.debug = config.debug;
  }

  /**
   * Parse incoming data learn more by checking visitor pattern
   * @param fname - function name to be visited
   * @param args - function arguments
   * @param page - pdf page
   * @param dependencies - loaded pdf dependencies
   */
  visit(fname, args, page, dependencies) {
    if(FN_TEXT.indexOf(fname) > -1) {
      this.txt[fname](args, page, dependencies);
    } else if(FN_XOBJECT.indexOf(fname) > -1) {
      this.xobject[fname](args, page, dependencies);
    } else if (FN_IMAGE.indexOf(fname) > -1) {
      this.image[fname](args, page, dependencies);
    } else {
      console.warn(`Unimplemented operator ${fname}`);
    }
  }
}

module.exports = Visitor
