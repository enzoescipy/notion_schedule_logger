async function main()
{  //express
  const express = require('express')

  //middle-wares
  var bodyParser = require('body-parser')
  var helmet = require('helmet')
  var csp = require('helmet-csp')
  var compression = require('compression')
  var path = require('path')

  //project routers
  //var indexRouter = require('./routes/index')
  var crudRouter = require('./routes/router')

  //var fs = require('fs')
  const port = (8080)
  const app = express()

  //views engine setting
  app.set('views', './views');
  app.set('view engine', 'pug');

  //middlewares use
  app.use(bodyParser.urlencoded({extended: false}))
  app.use(compression())
  app.use(helmet())
  app.use(
      csp({
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'"],
          scriptSrc: ["'self' 'unsafe-inline'"],
        },
      })
    )

  //routers url and express static.
  app.use(express.static('public'));
  app.use('/node_modules',express.static(path.join(__dirname, '/node_modules')))
  app.use('/',crudRouter)

  //custom-wares
  //var Mongo = require("./module/mongodb-communicate/mongod_dbmanage_public")
  //await Mongo.initialize(dbnaming.maindatabase, dbnaming.collection[0])


  //404 error case
  app.use(function (req, res, next){
      res.status(404).send('404 cannot find any objects...')
  })

  //server error case
  app.use(function(err, req, res, next) {
      res.status(500).send("500 something wrong...")
      console.error(err.stack)
  })

  app.listen(port, () => console.log("app launched..."))
}

main()