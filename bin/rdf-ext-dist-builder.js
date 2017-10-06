#!/usr/bin/env node

const _ = require('lodash')
const distBuilder = require('../index')
const fs = require('fs')
const path = require('path')
const program = require('commander')

const version = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString()).version

function buildDistribution () {
  const options = {
    outputFilename: program.output || 'rdf-ext-' + version + '.js',
    modules: program.modules ? program.modules.split(',') : _.map(distBuilder.availableModules(), 'module'),
    sourceMap: !!program.debug,
    es5: !program.es2015
  }

  distBuilder.build(options).then((result) => {
    console.log('created distribution: ' + Math.floor(result.bundle.length / 1024 + 0.5) + 'kb')

    fs.writeFileSync(options.outputFilename, result.bundle)
  }).catch((err) => {
    console.error('error durring build process:')
    console.error(err.stack || err.message)
  })
}

function listModules () {
  const modules = distBuilder.availableModules()

  process.stdout.write('available modules:\n')

  _.keys(modules).forEach((key) => {
    process.stdout.write('\t' + modules[key].module + ': ' + modules[key].description + '\n')
  })
}

program
  .version(version)
  .option('-o, --output <file>', 'write distribution to this file')
  .option('-l, --list', 'list available modules')
  .option('-m, --modules <modules>', 'only include specified modules')
  .option('-d, --debug', 'add source map to distribution')
  .option('-6, --es2015', 'output ES2015 code')
  .parse(process.argv)

if (program.list) {
  listModules()
} else {
  buildDistribution()
}
