var express = require('express')
var router = express.Router()



//page router
router.get('/home',function(req, res) {
    res.render('index',{title: "fuck you, world!", iam: "/home"})
})

//locational href router
router.post('/api/notionUpdate', function(req, res) {
    console.log(req.body.portal)
    res.render('warp', {portal: req.body.portal})
})
module.exports = router