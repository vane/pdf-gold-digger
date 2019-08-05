const minimist = require('minimist');
const GoldDigger = require('./src/GoldDigger');
const FileManager = require('./src/pdf/FileManager');

const ver = "0.0.7";
const supportedFormat = ['txt', 'json', 'xml', 'html'];
const ERR_INVALID_FORMAT = `
Invalid output
Please specify one of those values : "${supportedFormat}"
`;

const helpText = `
ex. pdfdig -i input-file -o output_directory -f json

--input   or  -i   pdf file location (required)
--output  or  -o   pdf file location (optional default "out")
--debug   or  -d   show debug information (optional - default "false")
--format  or  -f   format (optional - default "txt") - ("${supportedFormat}")
--font    or  -t   extract fonts as ttf files
--help    or  -h   display this help message
--version or  -v   display version information
`;

// converts argument to boolean
const toBool = (val) => {
  return val === 'true' || val === 1 || val === true;
};

const argv = minimist(process.argv.slice(2));
// version
const version = argv['version'] || argv['v'];
if(toBool(version)) {
  console.log(`Version : ${ver}`);
  return;
}
// help
const help = argv['help'] || argv['h'];
if(toBool(help)) {
  console.log(helpText);
  return;
}
// input
const input = argv['input'] || argv['i'];
if(!input) {
  console.log(helpText);
  console.log(argv);
  return;
}
// output format
const format = argv['format'] || argv['f'] || 'txt';
if(format && supportedFormat.indexOf(format) < 0) {
  console.error(ERR_INVALID_FORMAT);
  return;
}
// output directory
const output = argv['output'] || argv['o'] || 'out';
FileManager.mkdirNotExists(output);
// other config - debug / fonts
const debug = argv['debug'] || argv['d'];
const fonts = argv['font'] || argv['t'];
// build configuration
const config = {};
config.paintFormXObject = false;
config.format = format;
config.outputDir = output;
config.input = input;
config.debug = toBool(debug);
config.fonts = toBool(fonts);

if(config.debug) console.log(input);

const gd = new GoldDigger(config);
gd.dig().then(() => {
  console.log('-----------------------------------------------');
  console.log('Results : ');
  FileManager.readdirSync(output).forEach(file => console.log(`${output}/${file}`));
  console.log('-----------------------------------------------');
});
