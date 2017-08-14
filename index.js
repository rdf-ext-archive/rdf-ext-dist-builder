var bluebird = require('bluebird')
var browserify = require('browserify')
var fs = require('fs')
var path = require('path')
var tmp = require('tmp')

function availableModules (filter) {
  var modules = JSON.parse(fs.readFileSync(path.join(__dirname, './modules.json')).toString())

  return Object.keys(modules).reduce(function (output, name) {
    if (filter && filter.indexOf(modules[name]) === -1) {
      return output
    }

    var package = JSON.parse(fs.readFileSync(path.join(__dirname, './node_modules/' + modules[name] + '/package.json')).toString())

    output[name] = {
      module: modules[name],
      description: package.description
    }

    return output
  }, {})
}

function buildEntryFile (filename, modules) {
  var content = 'var bundle = {\n'

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

function buildBundle (entryFilename, browserifyOptions) {
  var bundle = browserify(entryFilename, browserifyOptions)

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

  return bluebird.promisify(tmp.dir)().then(function (folder) {
    options.entryFilename = path.join(folder, options.entryFilename)

    var result = {}

    return buildEntryFile(options.entryFilename, options.modules).then(function () {
      return buildBundle(options.entryFilename, {
        debug: options.sourceMap,
        paths: [path.join(__dirname, 'node_modules')]
      })
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
  build: build
}
