/**
 * Base visitor class with default constructor
 */
class VisitorBase {
  /**
   * Constructor
   * @param config - configuration
   * @param {PdfPage} page
   */
  constructor (config, page) {
    this.config = config;
    this.page = page;
  }
}

module.exports = VisitorBase;
