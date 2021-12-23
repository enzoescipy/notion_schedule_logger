//express
const express = require('express')

//middle-wares
var bodyParser = require('body-parser')
var helmet = require('helmet')
var compression = require('compression')

//project routers
//var indexRouter = require('./routes/index')
var crudRouter = require('./routes/router')

//var fs = require('fs')
const port = (3000)
const app = express()

//views engine setting
app.set('views', './views');
app.set('view engine', 'pug');

//middlewares use
app.use(bodyParser.urlencoded({extended: false}))
app.use(compression())
app.use(helmet())

//routers url and express static.
app.use(express.static(__dirname + '/public'));
app.use('/',crudRouter)

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