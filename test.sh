#!/usr/bin/env bash
mkdir -p out
wget -O out/test.pdf -nc https://github.com/mozilla/pdf.js/raw/master/web/compressed.tracemonkey-pldi-09.pdf
node gd.js  -i './out/test.pdf' -f json > out/test.json
node gd.js  -i './out/test.pdf' -f text > out/test.txt
python3 -m json.tool out/test.json > out/test.formatted.json
yarn run esdoc

#-i ../../github.com/pdf.js/web/compressed.tracemonkey-pldi-09.pdf -f text
#-i ../../github.com/pdf.js/test/pdfs/cmykjpeg.pdf -f text
#-i ../../github.com/pdf.js/test/pdfs/images_1bit_grayscale.pdf -f text