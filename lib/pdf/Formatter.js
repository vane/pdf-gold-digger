class Formatter {

  constructor() {
    this.formatters = {
      json: new FormatterJSON(),
      xml: new FormatterXML(),
      text: new FormatterText(),
    }
  }

  start(format, doc, metadata) {
    const o = this.formatters[format].start(doc, metadata);
    console.log(o);
  }

  format(format, page, data, last) {
    const o = this.formatters[format].format(page, data, last);
    console.log(o);
  }

  end(format) {
    const o = this.formatters[format].end();
    console.log(o);
  }
}

class FormatterText {
  start(doc, metadata) {

  }

  format(page, data, last) {

  }

  end() {
    
  }

}

class FormatterJSON {
  start(doc, metadata) {
    const meta = JSON.stringify(metadata)
    return `{
      "pages_count": ${doc.numPages},
      "metadata": ${meta},
      "pages": {
    `
  }

  formatTextObject(textObject) {
    const txtObjOut = {lines: [], x: textObject.x, y: textObject.y};
    textObject.getData().forEach(textLine => {
      const txtLineOut = this.formatTextLine(textLine);
      txtObjOut.lines.push(txtLineOut);
    });
    return txtObjOut;
  }

  formatTextLine(textLine) {
    const txtLineOut = {
      text: [],
      x: textLine.x,
      y: textLine.y,
      w: textLine.w,
      h: textLine.h,
      textMatrix: textLine.textMatrix,
    }
    textLine.getData().forEach(textFont => {
      const txtFontOut = this.formatTextFont(textFont);
      txtLineOut.text.push(txtFontOut);
    });
    return txtLineOut;
  }

  formatTextFont(textFont) {
    const font = textFont.getFont();
    return {
      font: {
        size: font.size,
        direction: font.direction,
        family: font.family,
        style: font.style,
        weight: font.weight,
      },
      text: textFont.getText(),
      charSpacing: textFont.charSpacing,
      wordSpacing: textFont.wordSpacing,
    }
  }

  format(page, data, last) {
    const txtData = [];
    data.forEach(textObject => {
      const txtObjOut = this.formatTextObject(textObject);
      txtData.push(txtObjOut);
    });
    let output = {
      "data": txtData,
    }
    const out = JSON.stringify(output)// pretty print (output, null, 4)
    return `"${page.pageIndex}": ${out}${last ? '': ','}`
  }

  end() {
    return `}
    }
    `
  }
}

class FormatterXML {
  start(doc, metadata) {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <document>
    `
  }

  format(page, data) {
    const output = '';
    return output
  }

  end() {
    return '</document>'
  }
}

module.exports = Formatter;