pdf-gold-digger
====

Pdf information extraction library based on [pdf.js](https://mozilla.github.io/pdf.js/)
and [node.js](https://nodejs.org).

### Install
```npm install -g pdf-gold-digger```


### Usage
```pdfdig -i some_file.pdf```
for help use :  
```pdfdig -h```
```bash
ex. pdfdig -i input-file -o output_directory -f json
  
  --input  or  -i   pdf file location (required)
  --output or  -o   pdf file location (optional default "out")
  --debug  or  -d   show debug information (optional - default "false")
  --format or  -f   format (optional - default "text") - ("text,json"): 
  --help   or  -h   display this help message
```

### Documentation url
[pdf-gold-digger](https://vane.pl/pdf-gold-digger/)


#### or test by clonning repository
```git clone https://github.com/vane/pdf-gold-digger```  
then run   
```sh demo.sh```  
and see results in ```out``` directory 

## Work in progress

### Supports:
- extract text
  - separate each page
  - separate each line
  - separate font information
  - bounding box position (probably buggy now)
- extract images
- output to text ```-f text (default)```
- output to json ```-f json```
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
