var express = require('express')
var router = express.Router()
var mongo_debug = require("../module/mongodb-communicate/mongod_dbmanage_generate")
var Mongo = require("../module/mongodb-communicate/mongod_dbmanage_public")
var Mongo_py = require("../module/mongodb-communicate/python_mongod")
var spawn = require("child_process").spawn



//homepage router
router.get('/',function(req, res) {
    res.render('home',{
                        title: "Dong hyo Ko,- enzoescipy\'s life challenge",
                    })
})

//notion testing router
router.get('/hardcoading',function(req, res) {
    mongo_debug.debug(0,0,0,function(doc) {
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
    Mongo.reloadDB_main(0,0,() => {
        console.log("(request) update data from notion -> server mongoDB ")
        res.render('warp', {portal: req.body.portal})
    })
})

//python test router
router.post('/api/pythonCalc/test', function(req, res) {
    //python raise
    var pythonProcess = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 0, "hehehe", 50, 1])
    pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString())
        res.render('warp', {portal:req.body.dir})
    })
})
//python test result router
router.get('/result/test', function(req, res) {
    Mongo_py.find_test(function (finded) {
        console.log("hello?",finded)
        res.render('pythonresult_test',{calculated : finded["value"]})
    })
})


module.exports = router