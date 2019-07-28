const util = require('pdfjs-dist/lib/shared/util');
const isNodeJS = require('pdfjs-dist/lib/shared/is_node');
const zlib = require('zlib');
const ImageKind = util.ImageKind;

/**
 * See pdf.js/src/display/svg.js
 */
const convertImgDataToPng = (() => {
  const PNG_HEADER =
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const CHUNK_WRAPPER_SIZE = 12;

  const crcTable = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let h = 0; h < 8; h++) {
      if (c & 1) {
        c = 0xedB88320 ^ ((c >> 1) & 0x7fffffff);
      } else {
        c = (c >> 1) & 0x7fffffff;
      }
    }
    crcTable[i] = c;
  }

  function crc32 (data, start, end) {
    let crc = -1;
    for (let i = start; i < end; i++) {
      const a = (crc ^ data[i]) & 0xff;
      const b = crcTable[a];
      crc = (crc >>> 8) ^ b;
    }
    return crc ^ -1;
  }

  function writePngChunk (type, body, data, offset) {
    let p = offset;
    const len = body.length;

    data[p] = len >> 24 & 0xff;
    data[p + 1] = len >> 16 & 0xff;
    data[p + 2] = len >> 8 & 0xff;
    data[p + 3] = len & 0xff;
    p += 4;

    data[p] = type.charCodeAt(0) & 0xff;
    data[p + 1] = type.charCodeAt(1) & 0xff;
    data[p + 2] = type.charCodeAt(2) & 0xff;
    data[p + 3] = type.charCodeAt(3) & 0xff;
    p += 4;

    data.set(body, p);
    p += body.length;

    const crc = crc32(data, offset + 4, p);
    data[p] = crc >> 24 & 0xff;
    data[p + 1] = crc >> 16 & 0xff;
    data[p + 2] = crc >> 8 & 0xff;
    data[p + 3] = crc & 0xff;
  }

  function adler32 (data, start, end) {
    let a = 1;
    let b = 0;
    for (let i = start; i < end; ++i) {
      a = (a + (data[i] & 0xff)) % 65521;
      b = (b + a) % 65521;
    }
    return (b << 16) | a;
  }

  /**
   * @param {Uint8Array} literals The input data.
   * @returns {Uint8Array} The DEFLATE-compressed data stream in zlib format.
   *   This is the required format for compressed streams in the PNG format:
   *   http://www.libpng.org/pub/png/spec/1.2/PNG-Compression.html
   */
  function deflateSync (literals) {
    if (!isNodeJS()) {
      // zlib is certainly not available outside of Node.js. We can either use
      // the pako library for client-side DEFLATE compression, or use the canvas
      // API of the browser to obtain a more optimal PNG file.
      return deflateSyncUncompressed(literals);
    }
    try {
      // NOTE: This implementation is far from perfect, but already way better
      // than not applying any compression.
      //
      // A better algorithm will try to choose a good predictor/filter and
      // then choose a suitable zlib compression strategy (e.g. 3,Z_RLE).
      //
      // Node v0.11.12 zlib.deflateSync is introduced (and returns a Buffer).
      // Node v3.0.0   Buffer inherits from Uint8Array.
      // Node v8.0.0   zlib.deflateSync accepts Uint8Array as input.
      let input;
      // eslint-disable-next-line no-undef
      if (parseInt(process.versions.node) >= 8) {
        input = literals;
      } else {
        // eslint-disable-next-line no-undef
        // input = new Buffer(literals);
        input = Buffer.from(literals);
      }
      // const output = __non_webpack_require__('zlib')
      const output = zlib
        .deflateSync(input, { level: 9 });
      return output instanceof Uint8Array ? output : new Uint8Array(output);
    } catch (e) {
      console.warn('Not compressing PNG because zlib.deflateSync is unavailable: ' + e);
    }

    return deflateSyncUncompressed(literals);
  }

  // An implementation of DEFLATE with compression level 0 (Z_NO_COMPRESSION).
  function deflateSyncUncompressed (literals) {
    let len = literals.length;
    const maxBlockLength = 0xFFFF;

    const deflateBlocks = Math.ceil(len / maxBlockLength);
    const idat = new Uint8Array(2 + len + deflateBlocks * 5 + 4);
    let pi = 0;
    idat[pi++] = 0x78; // compression method and flags
    idat[pi++] = 0x9c; // flags

    let pos = 0;
    while (len > maxBlockLength) {
      // writing non-final DEFLATE blocks type 0 and length of 65535
      idat[pi++] = 0x00;
      idat[pi++] = 0xff;
      idat[pi++] = 0xff;
      idat[pi++] = 0x00;
      idat[pi++] = 0x00;
      idat.set(literals.subarray(pos, pos + maxBlockLength), pi);
      pi += maxBlockLength;
      pos += maxBlockLength;
      len -= maxBlockLength;
    }

    // writing non-final DEFLATE blocks type 0
    idat[pi++] = 0x01;
    idat[pi++] = len & 0xff;
    idat[pi++] = len >> 8 & 0xff;
    idat[pi++] = (~len & 0xffff) & 0xff;
    idat[pi++] = (~len & 0xffff) >> 8 & 0xff;
    idat.set(literals.subarray(pos), pi);
    pi += literals.length - pos;

    const adler = adler32(literals, 0, literals.length); // checksum
    idat[pi++] = adler >> 24 & 0xff;
    idat[pi++] = adler >> 16 & 0xff;
    idat[pi++] = adler >> 8 & 0xff;
    idat[pi++] = adler & 0xff;
    return idat;
  }

  function encode (imgData, kind, forceDataSchema, isMask) {
    const width = imgData.width;
    const height = imgData.height;
    let bitDepth, colorType, lineSize;
    const bytes = imgData.data;

    switch (kind) {
      case ImageKind.GRAYSCALE_1BPP:
        colorType = 0;
        bitDepth = 1;
        lineSize = (width + 7) >> 3;
        break;
      case ImageKind.RGB_24BPP:
        colorType = 2;
        bitDepth = 8;
        lineSize = width * 3;
        break;
      case ImageKind.RGBA_32BPP:
        colorType = 6;
        bitDepth = 8;
        lineSize = width * 4;
        break;
      default:
        throw new Error('invalid format');
    }

    // prefix every row with predictor 0
    const literals = new Uint8Array((1 + lineSize) * height);
    let offsetLiterals = 0;
    let offsetBytes = 0;
    for (let y = 0; y < height; ++y) {
      literals[offsetLiterals++] = 0; // no prediction
      literals.set(bytes.subarray(offsetBytes, offsetBytes + lineSize),
        offsetLiterals);
      offsetBytes += lineSize;
      offsetLiterals += lineSize;
    }

    if (kind === ImageKind.GRAYSCALE_1BPP && isMask) {
      // inverting for image masks
      offsetLiterals = 0;
      for (let y = 0; y < height; y++) {
        offsetLiterals++; // skipping predictor
        for (let i = 0; i < lineSize; i++) {
          literals[offsetLiterals++] ^= 0xFF;
        }
      }
    }

    const ihdr = new Uint8Array([
      width >> 24 & 0xff,
      width >> 16 & 0xff,
      width >> 8 & 0xff,
      width & 0xff,
      height >> 24 & 0xff,
      height >> 16 & 0xff,
      height >> 8 & 0xff,
      height & 0xff,
      bitDepth, // bit depth
      colorType, // color type
      0x00, // compression method
      0x00, // filter method
      0x00, // interlace method
    ]);
    const idat = deflateSync(literals);

    // PNG consists of: header, IHDR+data, IDAT+data, and IEND.
    const pngLength = PNG_HEADER.length + (CHUNK_WRAPPER_SIZE * 3) +
      ihdr.length + idat.length;
    const data = new Uint8Array(pngLength);
    let offset = 0;
    data.set(PNG_HEADER, offset);
    offset += PNG_HEADER.length;
    writePngChunk('IHDR', ihdr, data, offset);
    offset += CHUNK_WRAPPER_SIZE + ihdr.length;
    writePngChunk('IDATA', idat, data, offset);
    offset += CHUNK_WRAPPER_SIZE + idat.length;
    writePngChunk('IEND', new Uint8Array(0), data, offset);
    return data;
    // return util.createObjectURL(data, 'image/png', forceDataSchema);
  }

  return function convertImgDataToPng (imgData, forceDataSchema, isMask) {
    const kind = (imgData.kind === undefined ? ImageKind.GRAYSCALE_1BPP : imgData.kind);
    return encode(imgData, kind, forceDataSchema, isMask);
  };
})();

module.exports = {
  convertImgDataToPng,
};
