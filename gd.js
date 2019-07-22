const GoldDigger = require('./lib/GoldDigger');
const minimist = require('minimist');

const help = `
--file -f pdf file location (required)
--debug -d show debug information (optional - default false)
--output -o output format (optional - default text)
`

const supportedOutput = ['text', 'xml'];
const ERR_INVALID_OUTPUT = `
Invalid output
Please specify one of those values : "${supportedOutput}"
`

// converts argument to boolean
const toBool = (val) => {
  return val === 'true' || val === 1 || val === true;
}

const argv = minimist(process.argv.slice(2))
const fpath = argv['file'] || argv['f'];
let debug = argv['debug'] || argv['d'];
let output = argv['output'] || argv['o'] || 'text';
debug = toBool(debug);
if(output && supportedOutput.indexOf(output) < 0) {
  console.error(ERR_INVALID_OUTPUT);
  return;
}
if(!fpath) {
  console.log(help);
  console.log(argv);
  return;
}
if(debug) console.log(fpath);

// configuration
const config = {};
config.paintFormXObject = false;
config.paintImageMaskXObject = false;
config.paintJpegXObject = false;
config.output = output;

const gd = new GoldDigger(config);
gd.dig(fpath, debug)
