//express
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
var Mongo = require("./module/mongodb-communicate/server_mongod")
Mongo.initialize()
Mongo.update()
Mongo.debug()


//404 error case
app.use(function (req, res, next){
    res.status(404).send('cannot find any objects...')
})

//server error case
app.use(function(err, req, res, next) {
    console.error(err,stack)
    res.status(500).send("something wrong...")
})

app.listen(port, () => console.log("app launched..."))
