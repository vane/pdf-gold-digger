const VisitorBase = require('./VisitorBase');
const Model = require('../model');
const pdfjs = require('../../pdfjs');
const FileManager = require('../FileManager');

/**
 * Visit image objects in pdf files
 * @extends {VisitorBase}
 */
class VisitorImage extends VisitorBase {
  /**
   * Constructor
   * @param config
   * @param {PdfPage} page
   */
  constructor (config, page) {
    super(config, page);
    FileManager.mkdirNotExists(`${this.config.outputDir}/img`);
  }

  /**
   * pdf.OPS.paintJpegXObject
   */
  paintJpegXObject (args) {
    if (this.config.debug) console.log('paintJpegXObject');
    // if (this.config.skip) return;
    const objId = args[1];
    const w = args[1];
    const h = args[2];
    console.log(objId, w, h);
  }

  /**
   * pdf.OPS.paintImageXObject
   */
  paintImageXObject (args) {
    if (this.config.debug) console.log('paintImageXObject');
    // if (this.config.skip) return;
    const imgData = this.page.data.objs.get(args[0]);
    this.paintInlineImageXObject([imgData, args[0]]);
  }

  /**
   * pdf.OPS.paintImageMaskXObject
   */
  paintImageMaskXObject (args) {
    if (this.config.debug) console.log('paintImageMaskXObject');
    // if (this.config.skip) return;
    this.paintInlineImageXObject(args[0]);
  }

  /**
   * pdf.OPS.paintInlineImageXObject
   */
  async paintInlineImageXObject (args) {
    if (this.config.debug) console.log('paintInlineImageXObject');
    // if (this.config.skip) return;
    const imgData = args[0];
    if (this.config.debug) console.log(`Image : ${imgData.width}x${imgData.height}`);
    // TODO imlement mask
    const mask = false;
    const imgBinary = pdfjs.convertImgDataToPng(imgData, this.forceDataSchema, !!mask);
    const fname = `page.${this.page.data.pageIndex}.${args[1]}.png`;
    const fpath = `${this.config.outputDir}/img/${fname}`;
    const image = new Model.ImageObject();
    image.fill(fname, this.page.x, this.page.y, imgData.width, imgData.height);
    this.page.addImage(image);
    await FileManager.saveFileAsync(fpath, imgBinary);
  }
}

module.exports = VisitorImage;
