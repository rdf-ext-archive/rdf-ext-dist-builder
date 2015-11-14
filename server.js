var _ = require('lodash')
var bodyParser = require('body-parser')
var distBuilder = require('./index')
var express = require('express')

var app = express()

app.set('view engine', 'jade')
app.set('views', './views')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))

app.get('/', function (req, res) {
  res.render('index', { modules: distBuilder.availableModules() })
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

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('RDF-Ext distribution builder running at http://%s:%s', host, port)
})
