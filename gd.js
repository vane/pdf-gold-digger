const GoldDigger = require('./src/GoldDigger');
const minimist = require('minimist');


const supportedFormat = ['text', 'json'];
const ERR_INVALID_FORMAT = `
Invalid output
Please specify one of those values : "${supportedFormat}"
`

const helpText = `
--input  or  -i   pdf file location (required)
--debug  or  -d   show debug information (optional - default false)
--format or  -f   format (optional - default "text") - ("${supportedFormat}"): 
--help   or  -h   display this help message
`

// converts argument to boolean
const toBool = (val) => {
  return val === 'true' || val === 1 || val === true;
}

const argv = minimist(process.argv.slice(2))
const help = argv['help'] || argv['h'];
if(help) {
  console.log(helpText);
  return;
}
const fpath = argv['input'] || argv['i'];
let debug = argv['debug'] || argv['d'];
let format = argv['format'] || argv['f'] || 'text';
debug = toBool(debug);
if(format && supportedFormat.indexOf(format) < 0) {
  console.error(ERR_INVALID_FORMAT);
  return;
}
if(!fpath) {
  console.log(helpText);
  console.log(argv);
  return;
}
if(debug) console.log(fpath);

// configuration
const config = {};
config.paintFormXObject = false;
config.paintImageMaskXObject = false;
config.paintJpegXObject = false;
config.format = format;

const gd = new GoldDigger(config);
gd.dig(fpath, debug)
