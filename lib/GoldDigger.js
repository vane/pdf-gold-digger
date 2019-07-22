const fs = require('fs');
const pdf = require('pdfjs-dist');
const ExtractText = require('./pdf/Extract');
const Text = require('./pdf/Text');

class GoldDiggerError extends Error{

}

// Based on pdf.js SVGGraphics
class GoldDigger {

  constructor() {
    this.txt = new ExtractText();
  }

  async dig(fpath, debug) {
    if (!fs.existsSync(fpath)) {
      throw new GoldDiggerError(`File not exists ${fpath}`);
    }
    if(debug) console.log('Reading pdf');
    // configuration
    const config = {};
    config.paintFormXObject = false;
    config.paintImageMaskXObject = false;
    config.paintJpegXObject = false;
    // read file
    const data = fs.readFileSync(fpath);
    if(debug) console.log(data.length);
    const doc = await pdf.getDocument({
      data:data,
    }).promise;
    if(debug) console.log(`Pages : ${doc.numPages}`);
    // read pages
    for(let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0, });
      //const text = await page.extractTextContent();
      const operatorList = await page.getOperatorList();
      // page.commonObjs, page.objs
      // load dependencies
      const dependencies = await this.loadDependencies(page, operatorList);
      const opTree = this.convertOpList(operatorList);
      if(debug) console.log(`--- BEGIN Page ${pageNum} size: ${viewport.width}x${viewport.height}`);
      const output = this.executeOpTree(opTree, page, dependencies, config);
      if(debug) console.log(`--- END Page ${pageNum} objects : ${output.length}`)
    }
  }

  async loadDependencies(page, operatorList) {
    const fnArray = operatorList.fnArray;
    const argsArray = operatorList.argsArray;
    const out = [];
    for (let i = 0, ii = fnArray.length; i < ii; i++) {
      if (fnArray[i] !== pdf.OPS.dependency) {
        continue;
      }
      for (const obj of argsArray[i]) {
        const objsPool = obj.startsWith('g_') ? page.commonObjs : page.objs;
        const o = await objsPool.get(obj);
        out.push(o);
      }
    }
    return out;
  }

  operatorMapping() {
    const mapping = {}
    for(var op in pdf.OPS) {
      mapping[pdf.OPS[op]] = op;
    }
    return mapping;
  }
  convertOpList(operatorList) {
    const operatorIdMapping = this.operatorMapping();
    const argsArray = operatorList.argsArray;
    const fnArray = operatorList.fnArray;
    const opList = [];
    for (let i = 0, ii = fnArray.length; i < ii; i++) {
      const fnId = fnArray[i];
      opList.push({
        'fnId': fnId,
        'fn': operatorIdMapping[fnId],
        'args': argsArray[i],
      });
    }
    return this.opListToTree(opList);
  }

  opListToTree(opList) {
    let opTree = [];
    const tmp = [];

    for (const opListElement of opList) {
      if (opListElement.fn === 'save') {
        opTree.push({ 'fnId': 92, 'fn': 'group', 'items': [], });
        tmp.push(opTree);
        opTree = opTree[opTree.length - 1].items;
        continue;
      }

      if (opListElement.fn === 'restore') {
        opTree = tmp.pop();
      } else {
        opTree.push(opListElement);
      }
    }
    return opTree;
  }

  executeOpTree(opTree, page, dependencies, config, tempList) {
    const debug = false;
    const objectList = tempList || [];
    let currentObject;
    let currentFont;
    if(objectList.length > 0) {
      currentObject = objectList[objectList.length - 1];
      currentFont = currentObject.getLine().getText().getFont()
    }
    let el;
    let el2;
    for (const opTreeElement of opTree) {
      const fn = opTreeElement.fn;
      const fnId = opTreeElement.fnId;
      const args = opTreeElement.args;

      switch (fnId | 0) {
        case pdf.OPS.beginText:
          if (debug) console.log('beginText');
          if (config.skip) break;
          currentObject = new Text.TextObject();
          currentObject.newLine();
          objectList.push(currentObject);
          break;
        case pdf.OPS.dependency:
          // Handled in `loadDependencies`, so no warning should be shown.
          break;
        case pdf.OPS.setLeading:
          if(debug) console.log('setLeading');
          //this.setLeading(args);
          break;
        case pdf.OPS.setLeadingMoveText:
          if(debug) console.log('setLeadingMoveText');
          //this.setLeadingMoveText(args[0], args[1]);
          break;
        case pdf.OPS.setFont:
          if (debug) console.log('setFont');
          if (config.skip) break;
          currentFont = this.txt.getFont(args, page, dependencies)
          //this.setFont(args);
          break;
        case pdf.OPS.showText:
          if (debug) console.log("showText");
          if (config.skip) break;
          el = currentObject.getLine();
          el.setFont(currentFont)
          el2 = el.getText();
          // first text element workaround
          el2.setText(this.txt.getText(args[0], el2)+" ");
          break;
        case pdf.OPS.showSpacedText:
          if (debug) console.log("showSpacedText");
          if (config.skip) break;
          el = currentObject.getLine();
          el.setFont(currentFont)
          el2 = el.getText();
          // first text element workaround
          el2.setText(this.txt.getText(args[0], el2)+" ");
          break;
        case pdf.OPS.endText:
          if (debug) console.log('endText');
          if (config.skip) break;
          currentObject = null;
          break;
        case pdf.OPS.moveText:
          if (debug) console.log('moveText');
          if (config.skip) break;
          el = currentObject.getLine();
          let x = args[0], y = args[1];
          const newLine = el.isNewLine(y);
          // new line
          if(newLine) {
            el.printText();
            el = currentObject.newLine();
          }
          // create new text element always after new line
          el2 = el.newText();
          el2.x = currentObject.x += x;
          el2.y = currentObject.y += y;
          // assign to calculate bounding box
          el.setPosition(currentObject.x, currentObject.y);
          break;
        case pdf.OPS.setTextMatrix:
          if (debug) console.log('setTextMatrix');
          if (config.skip) break;
          let a = args[0], b = args[1], c = args[2], d = args[3], e = args[4], f = args[5];
          el = currentObject.getLine();
          el2 = el.newText();
          el.textMatrix = [a, b, c, d, e, f];
          break;
        case pdf.OPS.setCharSpacing:
          //this.setCharSpacing(args[0]);
          if (debug) console.log('setCharSpacing');
          if (config.skip) break;
          break;
        case pdf.OPS.setWordSpacing:
          if (debug) console.log('setWordSpacing');
          if (config.skip) break;
          //this.setWordSpacing(args[0]);
          break;
        case pdf.OPS.setHScale:
          //this.setHScale(args[0]);
          if (debug) console.log('setHScale');
          break;
        case pdf.OPS.setTextRise:
          if (debug) console.log('setTextRise');
          //this.setTextRise(args[0]);
          break;
        case pdf.OPS.setTextRenderingMode:
          if (debug) console.log('setTextRenderingMode');
          //this.setTextRenderingMode(args[0]);
          break;
        case pdf.OPS.setLineWidth:
          if (debug) console.log('setLineWidth');
          //this.setLineWidth(args[0]);
          break;
        case pdf.OPS.setLineJoin:
          if (debug) console.log('setLineJoin');
          //this.setLineJoin(args[0]);
          break;
        case pdf.OPS.setLineCap:
          if (debug) console.log('setLineCap');
          //this.setLineCap(args[0]);
          break;
        case pdf.OPS.setMiterLimit:
          if(debug) console.log('setMiterLimit');
          //this.setMiterLimit(args[0]);
          break;
        case pdf.OPS.setFillRGBColor:
          if(debug) console.log('setFillRGBColor');
          //this.setFillRGBColor(args[0], args[1], args[2]);
          break;
        case pdf.OPS.setStrokeRGBColor:
          if(debug) console.log('setStrokeRGBColor');
          //this.setStrokeRGBColor(args[0], args[1], args[2]);
          break;
        case pdf.OPS.setStrokeColorN:
          if(debug) console.log('setStrokeColorN');
          //this.setStrokeColorN(args);
          break;
        case pdf.OPS.setFillColorN:
          if(debug) console.log('setFillColorN');
          //this.setFillColorN(args);
          break;
        case pdf.OPS.shadingFill:
          if(debug) console.log('shadingFill');
          //this.shadingFill(args[0]);
          break;
        case pdf.OPS.setDash:
          if(debug) console.log('setDash');
          //this.setDash(args[0], args[1]);
          break;
        case pdf.OPS.setRenderingIntent:
          if(debug) console.log('setRenderingIntent');
          //this.setRenderingIntent(args[0]);
          break;
        case pdf.OPS.setFlatness:
          if(debug) console.log('setFlatness');
          //this.setFlatness(args[0]);
          break;
        case pdf.OPS.setGState:
          if(debug) console.log('setGState');
          //this.setGState(args[0]);
          break;
        case pdf.OPS.fill:
          if(debug) console.log('fill');
          //this.fill();
          break;
        case pdf.OPS.eoFill:
          if(debug) console.log('eoFill');
          //this.eoFill();
          break;
        case pdf.OPS.stroke:
          if(debug) console.log('stroke');
          //this.stroke();
          break;
        case pdf.OPS.fillStroke:
          if(debug) console.log('fillStroke');
          //this.fillStroke();
          break;
        case pdf.OPS.eoFillStroke:
          if(debug) console.log('eoFillStroke');
          //this.eoFillStroke();
          break;
        case pdf.OPS.clip:
          if(debug) console.log('clip');
          //this.clip('nonzero');
          break;
        case pdf.OPS.eoClip:
          if(debug) console.log('eoClip');
          //this.clip('evenodd');
          break;
        case pdf.OPS.paintSolidColorImageMask:
          if(debug) console.log('paintSolidColorImageMask');
          //this.paintSolidColorImageMask();
          break;
        case pdf.OPS.paintJpegXObject:
          if(debug) console.log('paintJpegXObject');
          //this.paintJpegXObject(args[0], args[1], args[2]);
          break;
        case pdf.OPS.paintImageXObject:
          if(debug) console.log('paintImageXObject');
          //this.paintImageXObject(args[0]);
          break;
        case pdf.OPS.paintInlineImageXObject:
          if(debug) console.log('paintInlineImageXObject');
          //this.paintInlineImageXObject(args[0]);
          break;
        case pdf.OPS.paintImageMaskXObject:
          if(debug) console.log('paintImageMaskXObject');
          config.skip = true;
          //this.paintImageMaskXObject(args[0]);
          break;
        case pdf.OPS.paintFormXObjectBegin:
          if(debug) console.log('paintFormXObjectBegin');
          if(!config.paintFormXObject) {
            config.skip = true;
          }
          //this.paintFormXObjectBegin(args[0], args[1]);
          break;
        case pdf.OPS.paintFormXObjectEnd:
          if(debug) console.log('paintFormXObjectEnd');
          config.skip = false;
          //this.paintFormXObjectEnd();
          break;
        case pdf.OPS.closePath:
          if(debug) console.log('closePath');
          //this.closePath();
          break;
        case pdf.OPS.closeStroke:
          if(debug) console.log('closeStroke');
          //this.closeStroke();
          break;
        case pdf.OPS.closeFillStroke:
          if(debug) console.log('closeFillStroke');
          //this.closeFillStroke();
          break;
        case pdf.OPS.closeEOFillStroke:
          if(debug) console.log('closeEOFillStroke');
          //this.closeEOFillStroke();
          break;
        case pdf.OPS.nextLine:
          if(debug) console.log('nextLine');
          console.log('\r\n');
          //this.nextLine();
          break;
        case pdf.OPS.transform:
          if(debug) console.log('transform');
          //this.transform(args[0], args[1], args[2], args[3], args[4], args[5]);
          break;
        case pdf.OPS.constructPath:
          if(debug) console.log('constructPath');
          //this.constructPath(args[0], args[1]);
          break;
        case pdf.OPS.endPath:
          if(debug) console.log('endPath');
          //this.endPath();
          break;
        case 92:
          if(debug) console.log('executeOpTree');
          this.executeOpTree(opTreeElement.items, page, dependencies, config, objectList);
          //this.group(opTreeElement.items);
          break;
        default:
          console.warn(`Unimplemented operator ${fn}`);
          break;
      }
    }
    return objectList;
  }
}

module.exports = GoldDigger