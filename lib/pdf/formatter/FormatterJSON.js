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

module.exports = FormatterJSON;
