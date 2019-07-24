pdf-gold-digger
====

Pdf information extraction library based on [pdf.js](https://mozilla.github.io/pdf.js/)
and [node.js](https://nodejs.org).

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
  --format or  -f   format (optional - default "text") - ("text,json"): 
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
- specify output directory

## TODO:
- extract text
  - bounding box position
- load pdf from remote location
  - from url    
- output to xml format
- output to html format
- output to markdown format
- output to zip
- extract font
- extract tables
- advanced font information
- extract forms
- extract drawings
