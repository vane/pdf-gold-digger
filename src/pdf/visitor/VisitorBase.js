/**
 * Base visitor class with default constructor
 */
class VisitorBase {
  constructor(config, pageData, dependencies, objectList) {
    this.config = config;
    this.pageData = pageData;
    this.dependencies = dependencies;
    this.objectList = objectList;
  }
}

module.exports = VisitorBase;