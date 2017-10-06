const bluebird = require('bluebird')
const browserify = require('browserify')
const fs = require('fs')
const path = require('path')
const tmp = require('tmp')

function distBuilderInfo () {
  const packageInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')).toString())

  return {
    module: 'rdf-ext-dist-builder',
    description: packageInfo.description,
    version: packageInfo.version
  }
}

function moduleInfo (key) {
  const packageInfo = JSON.parse(fs.readFileSync(path.join(__dirname, './node_modules/' + key + '/package.json')).toString())

  return {
    module: key,
    description: packageInfo.description,
    version: packageInfo.version
  }
}

function availableModules (filter) {
  const modules = JSON.parse(fs.readFileSync(path.join(__dirname, './modules.json')).toString())

  return Object.keys(modules).reduce((output, name) => {
    if (filter && filter.indexOf(modules[name]) === -1) {
      return output
    }

    output[name] = moduleInfo(modules[name])

    return output
  }, {})
}

function buildEntryFile (filename, modules) {
  let content = ''

  // always load head before any other modules
  content += 'require(\'lib/head\')\n'

  // modules bundle
  content += 'var bundle = {\n'

  modules = availableModules(modules)

  content += Object.keys(modules).map((name) => {
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
  const browserifyOptions = {
    basedir: __dirname,
    debug: options.sourceMap,
    paths: [__dirname, path.join(__dirname, 'node_modules')]
  }

  const bundle = browserify(entryFilename, browserifyOptions)

  if (options.es5) {
    bundle.transform('babelify', {
      global: true,
      presets: [require('babel-preset-es2015')]
    })
  }

  return new Promise((resolve, reject) => {
    bundle.bundle((err, built) => {
      if (err) {
        reject(err)
      } else {
        resolve(built)
      }
    })
  })
}

function build (options) {
  options = options || {}
  options.entryFilename = options.entryFilename || 'rdf-ext.js'
  options.sourceMap = 'sourceMap' in options ? !!options.sourceMap : true
  options.es5 = 'es5' in options ? !!options.es5 : true

  return bluebird.promisify(tmp.dir)().then((folder) => {
    options.entryFilename = path.join(folder, options.entryFilename)

    const result = {}

    return buildEntryFile(options.entryFilename, options.modules).then(() => {
      return buildBundle(options.entryFilename, options)
    }).then((bundle) => {
      result.bundle = bundle

      return bluebird.promisify(fs.unlink)(options.entryFilename)
    }).then(() => {
      return bluebird.promisify(fs.rmdir)(folder)
    }).then(() => {
      return result
    })
  })
}

module.exports = {
  availableModules: availableModules,
  distBuilderInfo: distBuilderInfo,
  build: build,
  moduleInfo: moduleInfo
}
