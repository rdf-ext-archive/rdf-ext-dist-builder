#!/usr/bin/env node
var _ = require('lodash')
var distBuilder = require('../index')
var fs = require('fs')
var path = require('path')
var program = require('commander')

var version = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString()).version

function buildDistribution () {
  var options = {
    outputFilename: program.output || 'rdf-ext-' + version + '.js',
    modules: program.modules ? program.modules.split(',') : _.map(distBuilder.availableModules(), 'module'),
    sourceMap: !!program.debug
  }

  distBuilder.build(options).then(function (result) {
   console.log('created distribution: ' + Math.floor(result.bundle.length / 1024 + 0.5) + 'kb')

   fs.writeFileSync(options.outputFilename, result.bundle)
 }).catch(function (error) {
   console.error('error durring build process:')
   console.error(error.stack || error.message)
 })
}

function listModules() {
  var modules = distBuilder.availableModules()

  process.stdout.write('available modules:\n')

  _.keys(modules).forEach(function (key) {
    process.stdout.write('\t' + modules[key].module + ': ' + modules[key].description + '\n')
  })
}

program
  .version(version)
  .option('-o, --output <file>', 'write distribution to this file')
  .option('-l, --list', 'list available modules')
  .option('-m, --modules <modules>', 'only include specified modules')
  .option('-d, --debug', 'add source map to distribution')
  .parse(process.argv)

if (program.list) {
  return listModules()
} else {
  return buildDistribution()
}


