const VisitorBase = require('./VisitorBase');
const pdfjs = require('../../pdfjs');
const FileManager = require('../FileManager');

/**
 * Visit image objects in pdf files
 */
class VisitorImage extends VisitorBase {

  constructor (config, pageData, dependencies, objectList) {
    super(config, pageData, dependencies, objectList);
    // this.debug = true;
    FileManager.mkdirNotExists(`${this.config.outputDir}/img`);
  }

  /**
   * pdf.OPS.paintJpegXObject
   */
  paintJpegXObject(args) {
    if (this.config.debug) console.log('paintJpegXObject');
    // if (this.config.skip) return;
    const objId = args[1], w = args[1], h = args[2];
    console.log(objId);
  }


  /**
   * pdf.OPS.paintImageXObject
   */
  paintImageXObject(args) {
    if (this.config.debug) console.log('paintImageXObject');
    // if (this.config.skip) return;
    const imgData = page.objs.get(args[0]);
    this.paintInlineImageXObject([imgData, args[0]]);
  }

  /**
   * pdf.OPS.paintImageMaskXObject
   */
  paintImageMaskXObject(args) {
    if (this.config.debug) console.log('paintImageMaskXObject');
    // if (this.config.skip) return;
    this.paintInlineImageXObject(args[0]);
  }

  /**
   * pdf.OPS.paintInlineImageXObject
   */
  async paintInlineImageXObject(args) {
    if (this.config.debug) console.log('paintInlineImageXObject');
    // if (this.config.skip) return;
    const imgData = args[0];
    if (this.debug) console.log(`Image : ${imgData.width}x${imgData.height}`);
    // TODO imlement mask
    const mask = false;
    const imgBinary = pdfjs.convertImgDataToPng(imgData, this.forceDataSchema, !!mask);
    const fpath = `${this.config.outputDir}/img/page.${this.pageData.pageIndex}.${args[1]}.png`
    await FileManager.saveFileAsync(fpath, imgBinary);
  }
}

module.exports = VisitorImage;
