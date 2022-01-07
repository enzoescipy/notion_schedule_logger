var express = require('express')
var router = express.Router()
var Mongo = require("../module/mongodb-communicate/server_mongod")
var spawn = require("child_process").spawn


//homepage router
router.get('/',function(req, res) {
    res.render('home',{
                        title: "Dong hyo Ko,- enzoescipy\'s life challenge",
                    })
})

//notion testing router
router.get('/hardcoading',function(req, res) {
    Mongo.debug(function(doc) {
        var DBdata = doc
        console.log("(get) show data inside of mongoDB")
        res.render('index',{
                            db: JSON.stringify(DBdata),
                            title: "Dong hyo Ko - enzoescipy's life challenge",
                            iam: "/hardcoading",
        })
    })
})

//notion update router
router.post('/api/notionUpdate', function(req, res) {
    Mongo.update(() => {
        console.log("(request) update data from notion -> server mongoDB ")
        res.render('warp', {portal: req.body.portal, sending:""})
    })
})

//python test router
router.post('/api/pythonCalc/test', function(req, res) {
    console.log("hello, sorld?")

    var dir = req.body.dir
    //python raise
    var pythonProcess = spawn('../python3-server/bin/python', ["../module/mongoCalc/main.py", 0])
    pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString())
        /*
        res.render('warp', {portal:dir, sending:data.toString()})
        */
    })
})
/*
//python test result router
router.post('/result/test', function(req, res) {
    res.render('pythonresult_test',{calculated : req.query.sending})
})

*/

module.exports = router