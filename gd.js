const GoldDigger = require('./lib/GoldDigger');
const minimist = require('minimist');

const help = `
--file -f pdf file location
--debug -d show debug information
`
// converts argument to boolean
const toBool = (val) => {
  return val === 'true' || val === 1 || val === true;
}

const argv = minimist(process.argv.slice(2))
const fpath = argv['file'] || argv['f'];
let debug = argv['debug'] || argv['d'];
debug = toBool(debug);
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

const gd = new GoldDigger(config);
gd.dig(fpath, debug)
