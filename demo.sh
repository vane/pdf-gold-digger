#!/usr/bin/env bash
mkdir -p out
wget -O out/test.pdf -nc https://github.com/mozilla/pdf.js/raw/master/web/compressed.tracemonkey-pldi-09.pdf
node gd.js  -i './out/test.pdf' -f json > out/test.json
node gd.js  -i './out/test.pdf' -f text > out/test.txt