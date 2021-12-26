var express = require('express')
var router = express.Router()
var Mongo = require("../module/mongodb-communicate/server_mongod")



//page router
router.get('/home',function(req, res) {
    var DBdata = Mongo.debug()
    console.log("(get) show data inside of mongoDB")
    res.render('index',{
                        db: DBdata,
                        title: "fuck you, world!",
                        iam: "/home",
                        })
})

//notion update router
router.post('/api/notionUpdate', function(req, res) {
    Mongo.update()
    console.log("(request) update data from notion -> server mongoDB ")
    res.render('warp', {portal: req.body.portal})
})




module.exports = router