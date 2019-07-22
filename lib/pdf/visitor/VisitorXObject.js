
class VisitorXObject {
  constructor(config, debug, objectList) {
    this.config = config;
    this.debug = debug;
    this.objectList = objectList;
  }

  /**
   * pdf.OPS.setTextMatrix
   */
  setTextMatrix(args, page, dependencies) {
    if (this.debug) console.log('setTextMatrix');
    if (this.config.skip) return;
    /*const a = args[0], b = args[1], c = args[2], d = args[3], e = args[4], f = args[5];
    const el = this.currentObject.getLine();
    // new text font
    el.newText();
    el.textMatrix = [a, b, c, d, e, f];*/
  }

  /**
   * pdf.OPS.paintFormXObjectBegin
   */
  paintFormXObjectBegin(args, page, dependencies) {
    if(this.debug) console.log('paintFormXObjectBegin');
    if(!this.config.paintFormXObject) {
      this.config.skip = true;
    }
  }

  /**
   * pdf.OPS.paintFormXObjectEnd
   */
  paintFormXObjectEnd(args, page, dependencies) {
    if(this.debug) console.log('paintFormXObjectEnd');
    this.config.skip = false;
  }
}
