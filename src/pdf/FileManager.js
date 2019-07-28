const fs = require('fs');

/**
 * Save file data to directory
 * @param fpath - path to file with extension
 * @param data - file content
 * @returns {Promise<void>}
 */
const saveFileAsync = async (fpath, data) => {
  const stream = fs.createWriteStream(fpath);
  await stream.write(data);
  await stream.end();
};

/**
 * Make directory if not exists in given path
 * @param path - directory path
 */
const mkdirNotExists = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

/**
 * Check if file exists in given path
 * @param path
 * @returns {boolean}
 */
const fileExistsSync = (path) => fs.existsSync(path);

/**
 * Reads directory
 * @param {string} path - directory path
 * @returns {string[]} - directory listing
 */
const readdirSync = (path) => fs.readdirSync(path);

module.exports = {
  saveFileAsync,
  mkdirNotExists,
  fileExistsSync,
  readdirSync,
};
