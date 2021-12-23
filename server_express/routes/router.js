var express = require('express')
var router = express.Router()



//page router
router.get('/home',function(req, res) {
    res.render('index',{title: "hello, world!"})
})

//locational href router
router.get('/api/notionUpdate', function(req, res) {
    console.log("hello, world!")
    res.render('warp')//, {portal: 'http://naver.com'})
})
module.exports = router