const FontObject = require('./FontObject');

class ExtractText {
  getText(glyphs, line) {
    let partial = "";
    let x = 0;
    const font = line.getFont();
    for(const glyph of glyphs) {
      if (glyph === null) {
        // Word break
        x += font.direction * line.wordSpacing;
        continue;
      } else if (this.isNum(glyph)) {
        x += -glyph * font.size * 0.001;
        if (glyph < 0) {
          partial += " ";
        }
        continue;
      }
      const spacing = (glyph.isSpace ? line.wordSpacing : 0) + line.charSpacing;
      if(spacing > 0) {
        throw Error("Not implemented !")
      }
      partial += glyph.unicode;
      const width = glyph.width;
      const widthAdvanceScale = font.size * line.fontMatrix[0];
      const charWidth = width * widthAdvanceScale + spacing * font.direction;
      x += charWidth;
    }
    return partial;
  }

  getFontFamily(name, dependencies) {
    for(let i = 0;i<dependencies.length;i++) {
      if(dependencies[i].loadedName == name) {
        return dependencies[i]
      }
    }
    return null;
  }

  getFont(details, page, dependencies) {
    const fontObj = page.commonObjs.get(details[0]);
    const font = new FontObject()
    font.setSize(details[1]);
    font.weight = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
      (fontObj.bold ? 'bold' : 'normal');
    font.style = fontObj.italic ? 'italic' : 'normal';
    const family = this.getFontFamily(fontObj.loadedName, dependencies);
    if(family) {
      font.family = family.name;
    } else {
      font.family = fontObj.loadedName;
    }
    return font;
  }

  isNum(v) {
    return typeof v === 'number';
  }
}

module.exports = {
  ExtractText
}
