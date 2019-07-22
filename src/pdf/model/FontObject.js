/**
 * Store font information
 */
class FontObject {
  constructor() {
    this.size = 0;
    this.weight = null;
    this.style = null;
    this.family = null;
    this.direction = 1;
  }

  /**
   * Set font size based on number if it's negative it will be other font direction
   * @param size
   */
  setSize(size) {
    if (size < 0) {
      this.size = size;
      this.direction = -1;
    } else {
      this.size = size;
    }
  }
}
module.exports = FontObject