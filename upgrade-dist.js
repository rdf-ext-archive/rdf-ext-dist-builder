const path = require('path')
const shell = require('shelljs')

// check if there are any changes
if (shell.exec('node version-tool upgrade ./dist/versions.json ./dist/patch', {silent: true}).code === 0) {
  process.exit()
}

// filenames

const version = shell.exec('node version-tool version ./dist/patch', {silent: true}).stdout

const bundle = 'rdf-ext-all'

const files = {
  source: bundle + '-' + version + '.src.js',
  output: bundle + '-' + version + '.js',
  map: bundle + '-' + version + '.js.map',
  minified: bundle + '-' + version + '.min.js',
  minifiedMap: bundle + '-' + version + '.min.js.map'
}

// build + babel + uglify

shell.exec('node ./bin/rdf-ext-dist-builder --debug --es2015 --output ' + files.source)
shell.exec('./node_modules/.bin/babel --presets es2015 --source-maps inline ' + files.source + ' --out-file ' + files.output)
shell.exec('cat ' + files.output + ' | ./node_modules/.bin/exorcist ' + files.map + ' > /dev/null')
shell.exec('./node_modules/.bin/uglifyjs ' + files.output + ' --output ' + files.minified + ' --compress --in-source-map ' + files.map + ' --source-map filename=' + files.minifiedMap)

// copy files to dist folder

const distPath = './dist'

Object.keys(files).forEach((key) => {
  shell.mv(files[key], distPath)
})

// create symlinks to latest version

const links = {
  output: bundle + '-latest.js',
  map: bundle + '-latest.js.map',
  minified: bundle + '-latest.min.js',
  minifiedMap: bundle + '-latest.min.js.map'
}

Object.keys(links).forEach((key) => {
  shell.rm('-f', path.join(distPath, links[key]))
  shell.ln('-sf', files[key], path.join(distPath, links[key]))
})
