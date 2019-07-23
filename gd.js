const minimist = require('minimist');
const GoldDigger = require('./src/GoldDigger');
const FileManager = require('./src/pdf/FileManager');


const supportedFormat = ['text', 'json'];
const ERR_INVALID_FORMAT = `
Invalid output
Please specify one of those values : "${supportedFormat}"
`

const helpText = `
ex. pdfdig -i input-file -o output_directory -f json

--input  or  -i   pdf file location (required)
--output or  -o   pdf file location (optional default "out")
--debug  or  -d   show debug information (optional - default "false")
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

const input = argv['input'] || argv['i'];
const output = argv['output'] || argv['o'] || 'out';
let debug = argv['debug'] || argv['d'];
let format = argv['format'] || argv['f'] || 'text';
debug = toBool(debug);
if(format && supportedFormat.indexOf(format) < 0) {
  console.error(ERR_INVALID_FORMAT);
  return;
}
if(!input) {
  console.log(helpText);
  console.log(argv);
  return;
}
if(debug) console.log(input);

// configuration
const config = {};
config.paintFormXObject = false;
config.format = format;
config.outputDir = output;
config.input = input;
config.debug = debug;

FileManager.mkdirNotExists(output);
const gd = new GoldDigger(config);
gd.dig().then(() => {
  console.log("-----------------------------------------------");
  console.log("Results : ");
  FileManager.readdirSync(output).forEach(file => console.log(file));
  console.log("-----------------------------------------------");
});


