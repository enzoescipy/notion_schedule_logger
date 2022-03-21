var express = require('express')
var router = express.Router()
var mongoPublic = require("../module/mongodb-communicate/mongod_dbmanage_public")
var mongoSETTING = require("../module/mongodb-communicate/mongod_dbmanage_SETTINGs")
var spawn = require("child_process").spawn



//homepage router
router.get('/',function(req, res) {
    res.render('home',{
                        title: "Dong hyo Ko,- enzoescipy\'s life challenge",
                    })
})

//notion testing router
router.get('/hardcoading',function(req, res) {

    mongoSETTING.get(0,0,0,1,0,function(value) {
        console.log("(get) show data inside of mongoDB")
        res.render('index',{
                            showday_amount: value,
                            title: "Dong hyo Ko - enzoescipy's life challenge",
                            iam: "/hardcoading",
        })
    })
})



//notion update router
router.post('/api/notionUpdate', function(req, res) {
    mongoPublic.reloadDB_main(0,0,() => {
        console.log("(request) update data from notion -> server mongoDB ")
        res.render('warp', {portal: req.body.portal})
    })
})

router.post('/api/SETTINGsSet/', function(req, res) {
    mongoSETTING.set(0,0,req.body.slider1,0,1,0,function() {
        console.log("(request) update local settings in server. ")
        res.render('warp', {portal: req.body.portal2})
    })
})

//python test router
router.post('/api/pythonCalc/test', function(req, res) {
    //python raise
    var pythonProcess = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 1,"면도","2022-03-17",1])
    pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString())
        res.render('warp', {portal:req.body.dir})
    })
})


module.exports = router