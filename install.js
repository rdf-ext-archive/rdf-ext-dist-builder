var fs = require('fs')
var path = require('path')

function createDirectory (path) {
  try {
    fs.mkdirSync(path)
  } catch (e) {}
}

function createSymlink (src, dst) {
  try {
    fs.unlinkSync(dst)
  } catch (e) {}

  fs.symlinkSync(src, dst)
}

function createModuleSymlink (module, src, dst) {
  createSymlink(path.join(path.dirname(require.resolve(module)), src), dst)
}

createDirectory('./public/css')
createDirectory('./public/fonts')
createDirectory('./public/js')

createModuleSymlink('bootstrap', '../css/bootstrap.css', './public/css/bootstrap.css')
createModuleSymlink('bootstrap', '../css/bootstrap.css.map', './public/css/bootstrap.css.map')
createModuleSymlink('bootstrap', '../fonts/glyphicons-halflings-regular.eot', './public/fonts/glyphicons-halflings-regular.eot')
createModuleSymlink('bootstrap', '../fonts/glyphicons-halflings-regular.svg', './public/fonts/glyphicons-halflings-regular.svg')
createModuleSymlink('bootstrap', '../fonts/glyphicons-halflings-regular.ttf', './public/fonts/glyphicons-halflings-regular.ttf')
createModuleSymlink('bootstrap', '../fonts/glyphicons-halflings-regular.woff', './public/fonts/glyphicons-halflings-regular.woff')
createModuleSymlink('bootstrap', '../fonts/glyphicons-halflings-regular.woff2', './public/fonts/glyphicons-halflings-regular.woff2')
createModuleSymlink('bootstrap', '../js/bootstrap.js', './public/js/bootstrap.js')
createModuleSymlink('jquery', 'jquery.js', './public/js/jquery.js')
