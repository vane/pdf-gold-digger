class Point {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  moveX(val) {
    this.x += val;
  }

  moveY(val) {
    this.y += val;
  }

  setPosition(point) {
    this.x = point.x
    this.y = point.y;
  }
}

class BBox {
  constructor (x, y, width, height) {
    this.position = new Point(x, y)
    this.width = width || 0;
    this.height = height || 0;
  }
}

module.exports = {
  BBox, Point,
}