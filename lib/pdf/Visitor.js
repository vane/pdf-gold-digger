const VisitorText = require('./visitor/VisitorText');
const VisitorXObject = require('./visitor/VisitorXObject');
const FN_TEXT = ['beginText', 'setFont', 'showText', 'showSpacedText', 'endText', 'moveText'];
const FN_XOBJECT = ['setTextMatrix', 'paintFormXObjectBegin', 'paintFormXObjectEnd'];

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
    this.debug = false;
  }

  visit(fname, args, page, dependencies) {
    if(FN_TEXT.indexOf(fname) > -1) {
      this.txt[fname](args, page, dependencies);
    } else if(FN_XOBJECT.indexOf(fname) > -1) {
      this.xobject[fname](args, page, dependencies);
    } else {
      console.warn(`Unimplemented operator ${fn}`);
    }
  }
}

module.exports = Visitor
