var bluebird = require('bluebird')
var browserify = require('browserify')
var fs = require('fs')
var path = require('path')
var tmp = require('tmp')

function moduleInfo (key) {
  var package = JSON.parse(fs.readFileSync(path.join(__dirname, './node_modules/' + key + '/package.json')).toString())

  return {
    module: key,
    description: package.description,
    version: package.version
  }
}

function availableModules (filter) {
  var modules = JSON.parse(fs.readFileSync(path.join(__dirname, './modules.json')).toString())

  return Object.keys(modules).reduce(function (output, name) {
    if (filter && filter.indexOf(modules[name]) === -1) {
      return output
    }

    output[name] = moduleInfo(modules[name])

    return output
  }, {})
}

function buildEntryFile (filename, modules) {
  var content = ''

  // always load head before any other modules
  content += 'require(\'lib/head\')\n'

  // modules bundle
  content += 'var bundle = {\n'

  modules = availableModules(modules)

  content += Object.keys(modules).map(function (name) {
    return '  ' + name + ': require(\'' + modules[name].module + '\')'
  }).join(',\n')

  content += '}\n'

  // CommonJS interface
  content += 'module.exports = bundle\n'

  // attach to window
  content += 'if (window) { Object.keys(bundle).forEach(function (key) { window[key] = bundle[key] })}\n'

  return bluebird.promisify(fs.writeFile)(filename, content)
}

function buildBundle (entryFilename, options) {
  var browserifyOptions = {
    basedir: __dirname,
    debug: options.sourceMap,
    paths: [__dirname, path.join(__dirname, 'node_modules')]
  }

  var bundle = browserify(entryFilename, browserifyOptions)

  if (options.es5) {
    bundle.transform('babelify', {
      global: true,
      presets: [require('babel-preset-es2015')]
    })
  }

  return new Promise(function (resolve, reject) {
    bundle.bundle(function (error, built) {
      if (error) {
        reject(error)
      } else {
        resolve(built)
      }
    })
  })
}

function build(options) {
  options = options || {}
  options.entryFilename = options.entryFilename || 'rdf-ext.js'
  options.sourceMap = 'sourceMap' in options ? !!options.sourceMap : true
  options.es5 = 'es5' in options ? !!options.es5 : true

  return bluebird.promisify(tmp.dir)().then(function (folder) {
    options.entryFilename = path.join(folder, options.entryFilename)

    var result = {}

    return buildEntryFile(options.entryFilename, options.modules).then(function () {
      return buildBundle(options.entryFilename, options)
    }).then(function (bundle) {
      result.bundle = bundle

      return bluebird.promisify(fs.unlink)(options.entryFilename)
    }).then(function () {
      return bluebird.promisify(fs.rmdir)(folder)
    }).then(function () {
      return result
    })
  })
}

module.exports = {
  availableModules: availableModules,
  build: build,
  moduleInfo: moduleInfo
}
