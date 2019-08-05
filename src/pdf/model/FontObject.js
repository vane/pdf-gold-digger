/**
 * Store font information
 */
class FontObject {
  /**
   * Constructor
   */
  constructor () {
    /**
     * @type {number}
     */
    this.size = 0;
    /**
     * @type {number}
     */
    this.sizeScale = 1;
    /**
     * @type {string}
     */
    this.weight = 'normal';
    /**
     * @type {string}
     */
    this.style = null;
    /**
     * @type {string}
     */
    this.family = null;
    /**
     * @type {number}
     */
    this.direction = 1;
    /**
     * @type {boolean}
     */
    this.vertical = false;
    /**
     * @type {boolean}
     */
    this.spaceWidthIsSet = false;
    /**
     * @type {number}
     */
    this.spaceWidth = 250;
    this.loadedName = null;
    this.obj = null;
    this.opentype = null;
  }

  /**
   * Set font size based on number if it's negative it will be other font direction
   * @param {number} size
   */
  setSize (size) {
    if (size < 0) {
      this.size = size;
      this.direction = -1;
    } else {
      this.size = size;
    }
  }
}
module.exports = FontObject;
