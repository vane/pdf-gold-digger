const PdfObject = require('./PdfObject');

/**
 * Information about images
 */
class ImageObject extends PdfObject {
  /**
   * Constructor
   */
  constructor () {
    super();
    /**
     * @type {string} saved image name
     */
    this.name = '';
    /**
     * @type {number} document image width
     */
    this.width = 0;
    /**
     * @type {number} document image height
     */
    this.height = 0;
  }

  /**
   * Fill properties about this object
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  fill (name, x, y, width, height) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

module.exports = ImageObject;
