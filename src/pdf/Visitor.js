const Vis = require('./visitor');
const Model = require('./model');

const FN_TEXT = ['beginText', 'setFont', 'showText', 'showSpacedText', 'endText', 'moveText'];
const FN_XOBJECT = ['setTextMatrix', 'paintFormXObjectBegin', 'paintFormXObjectEnd'];
const FN_IMAGE = ['paintJpegXObject', 'paintImageXObject', 'paintInlineImageXObject', 'paintImageMaskXObject'];

/**
 * Visits pdf.OPT.* methods using pdf page data
 */
class Visitor {

  constructor (config, pageData, dependencies, debug) {
    this.objectList = [];
    this.config = config;
    this.config.skip = false;
    this.pageData = pageData;
    this.page = new Model.PdfPage()
    this.dependencies = dependencies;
    this.txt = new Vis.VisitorText(config, pageData, dependencies, debug, this.objectList);
    this.xobject = new Vis.VisitorXObject(config, pageData, dependencies, debug, this.objectList);
    this.image = new Vis.VisitorImage(config, pageData, dependencies, debug, this.objectList);
    this.debug = config.debug;
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
