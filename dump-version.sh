#!/bin/bash

VERSION=`./bin/rdf-ext-dist-builder.js --version`
BUNDLE=rdf-ext-all
DIST=$BUNDLE-$VERSION.js
DIST_MAP=$BUNDLE-$VERSION.js.map
DIST_MIN=$BUNDLE-$VERSION.min.js
DIST_MIN_MAP=$BUNDLE-$VERSION.min.js.map

./bin/rdf-ext-dist-builder.js -d -o $DIST
cat $DIST | ./node_modules/exorcist/bin/exorcist.js $DIST_MAP > /dev/null
./node_modules/uglify-js/bin/uglifyjs $DIST -o $DIST_MIN --compress --in-source-map $DIST_MAP --source-map $DIST_MIN_MAP

mv $DIST public/dist
mv $DIST_MAP public/dist
mv $DIST_MIN public/dist
mv $DIST_MIN_MAP public/dist
rm public/dist/$BUNDLE-latest.js
rm public/dist/$BUNDLE-latest.js.map
rm public/dist/$BUNDLE-latest.min.js
rm public/dist/$BUNDLE-latest.min.js.ap
ln -s $DIST public/dist/$BUNDLE-latest.js
ln -s $DIST_MAP public/dist/$BUNDLE-latest.js.map
ln -s $DIST_MIN public/dist/$BUNDLE-latest.min.js
ln -s $DIST_MIN_MAP public/dist/$BUNDLE-latest.min.js.ap
