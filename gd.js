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
const gd = new GoldDigger();
gd.dig(fpath, debug)
