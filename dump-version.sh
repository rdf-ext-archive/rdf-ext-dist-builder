#!/bin/bash

VERSION=`./bin/rdf-ext-dist-builder.js --version`
BUNDLE=rdf-ext-all
DIST_SRC=$BUNDLE-$VERSION.src.js
DIST=$BUNDLE-$VERSION.js
DIST_MAP=$BUNDLE-$VERSION.js.map
DIST_MIN=$BUNDLE-$VERSION.min.js
DIST_MIN_MAP=$BUNDLE-$VERSION.min.js.map

./bin/rdf-ext-dist-builder.js -d -o $DIST_SRC
./node_modules/.bin/babel --presets es2015 --source-maps inline $DIST_SRC -o $DIST
cat $DIST | ./node_modules/.bin/exorcist $DIST_MAP > /dev/null
./node_modules/.bin/uglifyjs $DIST -o $DIST_MIN --compress --in-source-map $DIST_MAP --source-map filename=$DIST_MIN_MAP

mkdir -p public/dist
mv $DIST_SRC public/dist
mv $DIST public/dist
mv $DIST_MAP public/dist
mv $DIST_MIN public/dist
mv $DIST_MIN_MAP public/dist
rm public/dist/$BUNDLE-latest.js
rm public/dist/$BUNDLE-latest.js.map
rm public/dist/$BUNDLE-latest.min.js
rm public/dist/$BUNDLE-latest.min.js.map
ln -s $DIST public/dist/$BUNDLE-latest.js
ln -s $DIST_MAP public/dist/$BUNDLE-latest.js.map
ln -s $DIST_MIN public/dist/$BUNDLE-latest.min.js
ln -s $DIST_MIN_MAP public/dist/$BUNDLE-latest.min.js.map
