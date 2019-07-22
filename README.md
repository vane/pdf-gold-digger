pdf-gold-digger
====

Pdf information extraction library based on [pdf.js](https://mozilla.github.io/pdf.js/)
and [node.js](https://nodejs.org).

#### Install
``npm install -g szczepano/pdf-gold-digger``  


### Usage
``pdfdig some_file.pdf``


#### or by clonning repository
``git clone https://github.com/vane/pdf-gold-digger``  
``node gd.js -f some_file.pdf``

## Work in progress

### Supports:
- extract text
  - separate each page
  - separate each line
  - separate font information
  - bounding box position (probably buggy now)
- output to text ``-o text (default)``
- output to json ``-o json`` 

### TODO:
- specify output directory    
- output to xml format
- ~~output to json format~~
- extract images to files
- extract font
- extract tables
- advanced font information
- extract forms
- extract drawings