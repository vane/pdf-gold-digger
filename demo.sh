#!/usr/bin/env bash
mkdir -p out
wget -O out/test.pdf -nc https://github.com/mozilla/pdf.js/raw/master/web/compressed.tracemonkey-pldi-09.pdf
node gd.js  -f './out/test.pdf' -o json > out/test.json
node gd.js  -f './out/test.pdf' -o text > out/test.txt