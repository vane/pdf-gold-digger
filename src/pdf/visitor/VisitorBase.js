/**
 * Base visitor class with default constructor
 */
class VisitorBase {
  constructor(config, page, dependencies, debug, objectList) {
    this.config = config;
    this.debug = debug;
    this.page = page;
    this.dependencies = dependencies;
    this.objectList = objectList;
  }
}

module.exports = VisitorBase;