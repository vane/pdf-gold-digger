pdf-gold-digger
====

Pdf information extraction library based on [pdf.js](https://mozilla.github.io/pdf.js/)
and [node.js](https://nodejs.org).

### Install
``npm install -g pdf-gold-digger``  


### Usage
``pdfdig -i some_file.pdf``  
see for help for all options  
``pdfdig -h``  

### Documentation url
[pdf-gold-digger](https://vane.pl/pdf-gold-digger/)


#### or test by clonning repository
``git clone https://github.com/vane/pdf-gold-digger``  
then run   
``sh demo.sh``  
and see results in ``out`` directory 

## Work in progress

### Supports:
- extract text
  - separate each page
  - separate each line
  - separate font information
  - bounding box position (probably buggy now)
- extract images
- output to text ``-f text (default)``
- output to json ``-f json`` 
- specify output directory

### TODO:
- load pdf from remote location
  - from url    
- output to xml format
- output to html format
- output to zip
- extract font
- extract tables
- advanced font information
- extract forms
- extract drawings