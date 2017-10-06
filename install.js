const path = require('path')
const shell = require('shelljs')

function modulePath (module, filepath) {
  return path.join(path.dirname(require.resolve(module)), filepath)
}

// distribution files
shell.mkdir('-p', './dist')

// web interface folder structure
shell.ln('-sf', '../dist', './public/dist')
shell.ln('-sf', modulePath('bootstrap', '../css'), './public/css')
shell.ln('-sf', modulePath('bootstrap', '../fonts'), './public/fonts')
shell.mkdir('-p', './public/js')
shell.ln('-sf', modulePath('bootstrap', '../js/bootstrap.js'), './public/js/bootstrap.js')
shell.ln('-sf', modulePath('jquery', 'jquery.js'), './public/js/jquery.js')
