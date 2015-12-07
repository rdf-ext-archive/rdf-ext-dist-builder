var _ = require('lodash')
var bodyParser = require('body-parser')
var distBuilder = require('./index')
var express = require('express')
var fs = require('fs')
var serveIndex = require('serve-index')

var app = express()

app.set('view engine', 'jade')
app.set('views', './views')

app.locals.modules = distBuilder.availableModules()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))

app.get('/', function (req, res) {
  res.render('index')
})

app.post('/', function (req, res, next) {
  var options = {
    modules: _.intersection(_.map(distBuilder.availableModules(), 'module'), _.keys(req.body)),
    sourceMap: true
  }

  distBuilder.build(options).then(function (result) {
    console.log('created distribution: ' + Math.floor(result.bundle.length / 1024 + 0.5) + 'kb')

    res.set('Content-Type', 'application/javascript').end(result.bundle)
  }).catch(function (error) {
    error.statusCode = 500

    next(error)
  })
})

if (fs.existsSync('public/dist')) {
  app.locals.dist = true
  app.use('/dist', serveIndex('public/dist'))
}

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('RDF-Ext distribution builder running at http://%s:%s', host, port)
})
