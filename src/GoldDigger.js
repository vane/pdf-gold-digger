const fs = require('fs');
const pdf = require('pdfjs-dist/es5/build/pdf');
const Visitor = require('./pdf/Visitor');
const Formatter = require('./pdf/Formatter');
const FileManager = require('./pdf/FileManager');
const Extract = require('./pdf/Extract');

/**
 * Generic error
 */
class GoldDiggerError extends Error {

}

/**
 * Base class for pdf-gold-digger
 * Code based on pdf.js SVGGraphics
 */
class GoldDigger {
  /**
   * Constructor
   * @param {object} config - configuration
   */
  constructor (config) {
    this.config = config;
    /**
     * @type {Formatter}
     */
    this.formatter = new Formatter(config);
  }

  /**
   * Checks if file exists load file to memory and returns PDFDocument
   */
  async getDocument () {
    if (!fs.existsSync(this.config.input)) {
      throw new GoldDiggerError(`File not exists ${this.config.input}`);
    }
    if (this.config.debug) console.log('Reading pdf');
    // read file
    const data = fs.readFileSync(this.config.input);
    if (this.config.debug) console.log(data.length);
    const doc = await pdf.getDocument({
      data: data,
      password: this.config.password,
    }).promise;
    return doc;
  }

  /**
   * Main method for pdf-gold-diger
   * @returns {Promise<void>}
   */
  async dig () {
    const doc = await this.getDocument();
    const debug = this.config.debug;
    if (debug) console.log(`Pages : ${doc.numPages}`);

    // fonts create directory if need to parse fonts
    let fonts = {};
    // prepare formatting
    const format = this.config.format;
    const metadata = await doc.getMetadata();
    this.formatter.start(format, doc, metadata.info);
    // read pages
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const pageData = await doc.getPage(pageNum);
      const viewport = pageData.getViewport({ scale: 1.0 });
      if (debug) console.log(`--- BEGIN Page ${pageNum} size: ${viewport.width}x${viewport.height}`);
      const page = await this.digPage(pageData, pageNum);
      if (this.config.fonts) {
        fonts = Object.assign(fonts, page.fonts);
      }
      const last = pageNum === doc.numPages;
      this.formatter.format(format, pageData, page.objectList, last);
      if (debug) console.log(`--- END Page ${pageNum} objects : ${page.objectList.length}`);
    }
    if(this.config.fonts) {
      this.formatter.formatFont(format, Extract.FONT_CACHE);
    }
    this.formatter.end(format);
    // save to file
    const fpath = `${this.config.outputDir}/data.${format}`;
    await FileManager.saveFileAsync(fpath, this.formatter.data);
    // save font files
    this.saveFonts(fonts);
  }

  /**
   * Save font data as ttf files
   * @param {array} fonts
   */
  saveFonts (fonts) {
    if (this.config.fonts) {
      const fontPath = `${this.config.outputDir}/font`;
      FileManager.mkdirNotExists(fontPath);
      Object.values(fonts).forEach(async (font) => {
        if (font.missingFile) {
          console.warn(`Font file missing ${font.name}`);
        } else {
          const fpath = `${fontPath}/${font.fname}`;
          if (!FileManager.fileExistsSync(fpath)) await FileManager.saveFileAsync(fpath, font.data);
        }
      });
    }
  }

  /**
   * Process page
   * @param pageData - pdf page
   * @param {number} pageNum - page number
   */
  async digPage (pageData, pageNum) {
    // const text = await page.extractTextContent();
    const operatorList = await pageData.getOperatorList();
    // page.commonObjs, page.objs
    // load dependencies
    const dependencies = await this.loadDependencies(pageData, operatorList);
    const opTree = this.convertOpList(operatorList);
    const visitor = new Visitor(this.config, pageData, dependencies);
    this.executeOpTree(opTree, visitor);
    return visitor.page;
  }

  /**
   * Loads pdf dependencies (pdf.js SVGGraphics)
   * @param pageData
   * @param operatorList
   * @returns {Promise<Array>}
   */
  async loadDependencies (pageData, operatorList) {
    const fnArray = operatorList.fnArray;
    const argsArray = operatorList.argsArray;
    const out = [];
    for (let i = 0, ii = fnArray.length; i < ii; i++) {
      if (fnArray[i] !== pdf.OPS.dependency) {
        continue;
      }
      for (const obj of argsArray[i]) {
        const objsPool = obj.startsWith('g_') ? pageData.commonObjs : pageData.objs;
        const o = await objsPool.get(obj);
        out.push(o);
      }
    }
    return out;
  }

  /**
   * (pdf.js SVGGraphics)
   */
  operatorMapping () {
    const mapping = {};
    for (const op in pdf.OPS) {
      mapping[pdf.OPS[op]] = op;
    }
    return mapping;
  }

  /**
   * (pdf.js SVGGraphics)
   * @param operatorList
   * @returns {*}
   */
  convertOpList (operatorList) {
    const operatorIdMapping = this.operatorMapping();
    const argsArray = operatorList.argsArray;
    const fnArray = operatorList.fnArray;
    const opList = [];
    for (let i = 0, ii = fnArray.length; i < ii; i++) {
      const fnId = fnArray[i];
      opList.push({
        fnId,
        fn: operatorIdMapping[fnId],
        args: argsArray[i],
      });
    }
    return this.opListToTree(opList);
  }

  /**
   * (pdf.js SVGGraphics)
   * @param opList
   * @returns {Array}
   */
  opListToTree (opList) {
    let opTree = [];
    const tmp = [];

    for (const opListElement of opList) {
      if (opListElement.fn === 'save') {
        opTree.push({ fnId: 92, fn: 'group', items: [] });
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

  /**
   * Process pdf file format
   * Based on (pdf.js SVGGraphics)
   * @param opTree - pdf tree of information
   * @param {Visitor} visitor - class for parsing incoming tags
   */
  executeOpTree (opTree, visitor) {
    const debug = visitor.debug;
    for (const opTreeElement of opTree) {
      const fn = opTreeElement.fn;
      const fnId = opTreeElement.fnId;
      const args = opTreeElement.args;
      // following switch methods are those unimplemented - all implemented are in default
      switch (fnId | 0) {
        case pdf.OPS.beginAnnotations:
          break;
        case pdf.OPS.endAnnotations:
          break;
        case pdf.OPS.dependency:
          // Handled in `loadDependencies`, so no warning should be shown.
          break;
        case pdf.OPS.setLineWidth:
          if (debug) console.log('setLineWidth');
          // this.setLineWidth(args[0]);
          break;
        case pdf.OPS.setLineJoin:
          if (debug) console.log('setLineJoin');
          // this.setLineJoin(args[0]);
          break;
        case pdf.OPS.setLineCap:
          if (debug) console.log('setLineCap');
          // this.setLineCap(args[0]);
          break;
        case pdf.OPS.setMiterLimit:
          if (debug) console.log('setMiterLimit');
          // this.setMiterLimit(args[0]);
          break;
        case pdf.OPS.setFillRGBColor:
          if (debug) console.log('setFillRGBColor');
          // this.setFillRGBColor(args[0], args[1], args[2]);
          break;
        case pdf.OPS.setStrokeRGBColor:
          if (debug) console.log('setStrokeRGBColor');
          // this.setStrokeRGBColor(args[0], args[1], args[2]);
          break;
        case pdf.OPS.setStrokeColorN:
          if (debug) console.log('setStrokeColorN');
          // this.setStrokeColorN(args);
          break;
        case pdf.OPS.setFillColorN:
          if (debug) console.log('setFillColorN');
          // this.setFillColorN(args);
          break;
        case pdf.OPS.shadingFill:
          if (debug) console.log('shadingFill');
          // this.shadingFill(args[0]);
          break;
        case pdf.OPS.setDash:
          if (debug) console.log('setDash');
          // this.setDash(args[0], args[1]);
          break;
        case pdf.OPS.setRenderingIntent:
          if (debug) console.log('setRenderingIntent');
          // this.setRenderingIntent(args[0]);
          break;
        case pdf.OPS.setFlatness:
          if (debug) console.log('setFlatness');
          // this.setFlatness(args[0]);
          break;
        case pdf.OPS.setGState:
          if (debug) console.log('setGState');
          // this.setGState(args[0]);
          break;
        case pdf.OPS.fill:
          if (debug) console.log('fill');
          // this.fill();
          break;
        case pdf.OPS.eoFill:
          if (debug) console.log('eoFill');
          // this.eoFill();
          break;
        case pdf.OPS.stroke:
          if (debug) console.log('stroke');
          // this.stroke();
          break;
        case pdf.OPS.fillStroke:
          if (debug) console.log('fillStroke');
          // this.fillStroke();
          break;
        case pdf.OPS.eoFillStroke:
          if (debug) console.log('eoFillStroke');
          // this.eoFillStroke();
          break;
        case pdf.OPS.clip:
          if (debug) console.log('clip');
          // this.clip('nonzero');
          break;
        case pdf.OPS.eoClip:
          if (debug) console.log('eoClip');
          // this.clip('evenodd');
          break;
        case pdf.OPS.paintSolidColorImageMask:
          if (debug) console.log('paintSolidColorImageMask');
          // this.paintSolidColorImageMask();
          break;
        case pdf.OPS.paintImageMaskXObject:
          if (debug) console.log('paintImageMaskXObject');
          // this.paintImageMaskXObject(args[0]);
          break;
        case pdf.OPS.closePath:
          if (debug) console.log('closePath');
          // this.closePath();
          break;
        case pdf.OPS.closeStroke:
          if (debug) console.log('closeStroke');
          // this.closeStroke();
          break;
        case pdf.OPS.closeFillStroke:
          if (debug) console.log('closeFillStroke');
          // this.closeFillStroke();
          break;
        case pdf.OPS.closeEOFillStroke:
          if (debug) console.log('closeEOFillStroke');
          // this.closeEOFillStroke();
          break;
        case pdf.OPS.transform:
          if (debug) console.log('transform');
          // this.transform(args[0], args[1], args[2], args[3], args[4], args[5]);
          break;
        case pdf.OPS.constructPath:
          if (debug) console.log('constructPath');
          // this.constructPath(args[0], args[1]);
          break;
        case pdf.OPS.endPath:
          if (debug) console.log('endPath');
          // this.endPath();
          break;
        case 92:
          if (debug) console.log('executeOpTree');
          this.executeOpTree(opTreeElement.items, visitor);
          // this.group(opTreeElement.items);
          break;
        default:
          visitor.visit(fn, args, visitor);
          break;
      }
    }
  }
}

module.exports = GoldDigger;
