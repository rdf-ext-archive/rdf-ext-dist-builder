const _ = require('lodash')
const bodyParser = require('body-parser')
const distBuilder = require('.')
const express = require('express')
const fs = require('fs')
const serveIndex = require('serve-index')

const app = express()

app.set('view engine', 'jade')
app.set('views', './views')

app.locals.modules = distBuilder.availableModules()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/', (req, res, next) => {
  const options = {
    modules: _.intersection(_.map(distBuilder.availableModules(), 'module'), _.keys(req.body)),
    sourceMap: true
  }

  distBuilder.build(options).then((result) => {
    console.log('created distribution: ' + Math.floor(result.bundle.length / 1024 + 0.5) + 'kb')

    res.set('Content-Type', 'application/javascript').end(result.bundle)
  }).catch((err) => {
    err.statusCode = 500

    next(err)
  })
})

if (fs.existsSync('public/dist')) {
  app.locals.dist = true
  app.use('/dist', serveIndex('public/dist'))
}

const server = app.listen(8080, () => {
  const host = server.address().address
  const port = server.address().port

  console.log('RDF-Ext distribution builder running at http://%s:%s', host, port)
})
