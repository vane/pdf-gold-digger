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

  constructor (config, page, dependencies, debug) {
    this.objectList = [];
    this.config = config;
    this.config.skip = false;
    this.page = page;
    this.dependencies = dependencies;
    this.txt = new VisitorText(config, page, dependencies, debug, this.objectList);
    this.xobject = new VisitorXObject(config, page, dependencies, debug, this.objectList);
    this.image = new VisitorImage(config, page, dependencies, debug, this.objectList);
    this.debug = config.debug;
  }

  /**
   * Parse incoming data learn more by checking visitor pattern
   * @param fname - function name to be visited
   * @param args - function arguments
   * @param page - pdf page
   * @param dependencies - loaded pdf dependencies
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
