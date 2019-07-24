/**
 * Base visitor class with default constructor
 */
class VisitorBase {
  constructor(config, pageData, dependencies, debug, objectList) {
    this.config = config;
    this.debug = debug;
    this.pageData = pageData;
    this.dependencies = dependencies;
    this.objectList = objectList;
  }
}

module.exports = VisitorBase;