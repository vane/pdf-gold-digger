pdf-gold-digger
====

Pdf information extraction library based on [pdf.js](https://mozilla.github.io/pdf.js/)
and [node.js](https://nodejs.org) with various output formats.

[![GitHub](https://img.shields.io/github/license/vane/pdf-gold-digger)](https://github.com/vane/pdf-gold-digger/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/pdf-gold-digger)](https://npmjs.com/package/pdf-gold-digger)
[![GitHub commits since tagged version](https://img.shields.io/github/commits-since/vane/pdf-gold-digger/0.0.8)](https://github.com/vane/pdf-gold-digger)
[![GitHub last commit](https://img.shields.io/github/last-commit/vane/pdf-gold-digger)](https://github.com/vane/pdf-gold-digger)
[![doc](https://vane.pl/pdf-gold-digger/badge.svg)](https://vane.pl/pdf-gold-digger/)

## Install
```npm install -g pdf-gold-digger```

## Usage
```bash
pdfdig -i some_file.pdf
```  

## Avaliable commands

```bash
pdfdig -h
ex. pdfdig -i input-file -o output_directory -f json
  
  --input  or  -i   pdf file location (required)
  --output or  -o   pdf file location (optional default "out")
  --debug  or  -d   show debug information (optional - default "false")
  --format or  -f   format (optional - default "text") - ("text,json,xml,html") 
  --font   or  -t   extract fonts as ttf files (optional)
  --help   or  -h   display this help message
```

## Advanced usage
```bash
git clone https://github.com/vane/pdf-gold-digger
sh demo.sh
```
and see results in ```out``` directory 
                            
## Documentation
[pdf-gold-digger](https://vane.pl/pdf-gold-digger/)

## Features:
- extract text
  - separate each page
  - separate each line
  - separate font information
- extract images
- output formats
  - text ```-f text (default)```
  - json ```-f json```
  - xml  ```-f xml``` 
  - html  ```-f html``` 
- specify output directory

## TODO:
- load pdf from remote location
  - from url
- output to markdown format
- pack output to zip
- extract tables
- extract forms
- extract drawings
- extract text from glyphs 
  - ability to provide input file for glyph path to letter
  - detect when unicode is not provided or mangled  
  - get bounding box from text and draw it on canvas  
  - use tesseract.js as optional fallback  
