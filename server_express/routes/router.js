var express = require('express')
var router = express.Router()
var Mongo = require("../module/mongodb-communicate/server_mongod")


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
        res.render('warp', {portal: req.body.portal})
    })
})




module.exports = router