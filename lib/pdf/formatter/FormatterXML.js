
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

module.exports = FormatterXML;
