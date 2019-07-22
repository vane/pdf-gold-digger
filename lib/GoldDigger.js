const fs = require('fs');
const pdf = require('pdfjs-dist');
const Extract = require('./pdf/Extract');
const Executor = require('./pdf/Executor');
const Formatter = require('./pdf/Formatter');

class GoldDiggerError extends Error{

}

// Based on pdf.js SVGGraphics
class GoldDigger {

  constructor(config) {
    this.config = config;
    this.executor = new Executor(config);
    this.formatter = new Formatter()
  }

  async dig(fpath, debug) {
    if (!fs.existsSync(fpath)) {
      throw new GoldDiggerError(`File not exists ${fpath}`);
    }
    if(debug) console.log('Reading pdf');
    // read file
    const data = fs.readFileSync(fpath);
    if(debug) console.log(data.length);
    const doc = await pdf.getDocument({
      data:data,
    }).promise;
    if(debug) console.log(`Pages : ${doc.numPages}`);
    // prepare formatting
    const format = this.config.output;
    const metadata = await doc.getMetadata();
    this.formatter.start(format, doc, metadata.info);
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
      const output = this.executeOpTree(opTree, page, dependencies);
      const last = pageNum == doc.numPages;
      this.formatter.format(format, page, output, last);
      if(debug) console.log(`--- END Page ${pageNum} objects : ${output.length}`)
    }
    this.formatter.end(format);
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

  executeOpTree(opTree, page, dependencies) {
    const debug = this.executor.debug;
    for (const opTreeElement of opTree) {
      const fn = opTreeElement.fn;
      const fnId = opTreeElement.fnId;
      const args = opTreeElement.args;

      switch (fnId | 0) {
        case pdf.OPS.beginText:
          this.executor.beginText(args, page, dependencies);
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
          this.executor.setFont(args, page, dependencies);
          //this.setFont(args);
          break;
        case pdf.OPS.showText:
          this.executor.showText(args, page, dependencies);
          break;
        case pdf.OPS.showSpacedText:
          this.executor.showSpacedText(args, page, dependencies);
          break;
        case pdf.OPS.endText:
          this.executor.endText(args, page, dependencies);
          break;
        case pdf.OPS.moveText:
          this.executor.moveText(args, page, dependencies);
          break;
        case pdf.OPS.setTextMatrix:
          this.executor.setTextMatrix(args, page, dependencies);
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
          //this.paintImageMaskXObject(args[0]);
          break;
        case pdf.OPS.paintFormXObjectBegin:
          this.executor.paintFormXObjectBegin(args, page, dependencies);
          //this.paintFormXObjectBegin(args[0], args[1]);
          break;
        case pdf.OPS.paintFormXObjectEnd:
          this.executor.paintFormXObjectEnd(args, page, dependencies);
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
          this.executeOpTree(opTreeElement.items, page, dependencies);
          //this.group(opTreeElement.items);
          break;
        default:
          console.warn(`Unimplemented operator ${fn}`);
          break;
      }
    }
    return this.executor.objectList;
  }
}

module.exports = GoldDigger