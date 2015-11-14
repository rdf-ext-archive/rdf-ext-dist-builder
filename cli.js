#!/usr/bin/env node
var _ = require('lodash')
var distBuilder = require('./index')
var fs = require('fs')

var options = {
  outputFilename: 'rdf-ext-dist.js',
  modules: _.map(distBuilder.availableModules(), 'module'),
  sourceMap: true
}

distBuilder.build(options).then(function (result) {
  console.log('created distribution: ' + Math.floor(result.bundle.length / 1024 + 0.5) + 'kb')

  fs.writeFileSync(options.outputFilename, result.bundle)
}).catch(function (error) {
  console.error('error durring build process:')
  console.error(error.stack || error.message)
})
