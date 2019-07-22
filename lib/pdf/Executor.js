const Extract = require('./Extract');
const Text = require('./Text');

class Executor {

  constructor (config, debug) {
    this.txt = new Extract.ExtractText();
    this.objectList = [];
    this.config = config;
    this.skip = false;
    this.debug = false;
    this.currentObject;
    this.currentFont;
  }
  
  beginText(args, page, dependencies) {
    if (this.debug) console.log('beginText');
    if (this.skip) return;
    this.currentObject = new Text.TextObject();
    this.currentObject.newLine();
    this.objectList.push(this.currentObject);
  }
  
  setFont(args, page, dependencies) {
    if (this.debug) console.log('setFont');
    if (this.skip) return;
    this.currentFont = this.txt.getFont(args, page, dependencies)
  }

  showText(args, page, dependencies) {
    if (this.debug) console.log("showText");
    if (this.skip) return;
    const el = this.currentObject.getLine();
    el.setFont(this.currentFont)
    const el2 = el.getText();
    // first text element workaround
    el2.setText(this.txt.getText(args[0], el2)+" ");
  }

  showSpacedText(args, page, dependencies) {
    if (this.debug) console.log("showSpacedText");
    if (this.skip) return;
    const el = this.currentObject.getLine();
    el.setFont(this.currentFont)
    const el2 = el.getText();
    // first text element workaround
    el2.setText(this.txt.getText(args[0], el2)+" ");
  }

  endText(args, page, dependencies) {
    if (this.debug) console.log('endText');
    if (this.skip) return;
    this.currentObject = null;
  }

  moveText(args, page, dependencies) {
    if (this.debug) console.log('moveText');
    if (this.skip) return;
    let el = this.currentObject.getLine();
    const x = args[0], y = args[1];
    const newLine = el.isNewLine(y);
    // new line
    if(newLine) {
      if(this.config.output === 'text') el.printText();
      el = this.currentObject.newLine();
    }
    // create new text element always after new line
    const el2 = el.newText();
    el2.x = this.currentObject.x += x;
    el2.y = this.currentObject.y += y;
    // assign to calculate bounding box
    el.setPosition(this.currentObject.x, this.currentObject.y);
  }

  setTextMatrix(args, page, dependencies) {
    if (this.debug) console.log('setTextMatrix');
    if (this.skip) return;
    const a = args[0], b = args[1], c = args[2], d = args[3], e = args[4], f = args[5];
    const el = this.currentObject.getLine();
    // new text font
    el.newText();
    el.textMatrix = [a, b, c, d, e, f];

  }

  paintFormXObjectBegin(args, page, dependencies) {
    if(this.debug) console.log('paintFormXObjectBegin');
    if(!this.config.paintFormXObject) {
      this.skip = true;
    }
  }

  paintFormXObjectEnd(args, page, dependencies) {
    if(this.debug) console.log('paintFormXObjectEnd');
    this.skip = false;
  }
}

module.exports = Executor