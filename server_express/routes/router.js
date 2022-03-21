const express = require('express')
const router = express.Router()
const mongoPublic = require("../module/mongodb-communicate/mongod_dbmanage_public")
const mongoSETTING = require("../module/mongodb-communicate/mongod_dbmanage_SETTINGs")

var dbtype_fixed = "test"
function dbtype(whoperspective)
{
    if (dbtype_fixed == "test")
    {
        if (whoperspective == "human"){return 1}else if (whoperspective == "mongo"){return 0}
    }
    else if (dbtype_fixed == "main")
    {
        if (whoperspective == "human"){return 0}else if (whoperspective == "mongo"){return 1}
    }
    else if (dbtype_fixed == "backup")
    {
        return 2
    }
}

var spawn = require("child_process").spawn



//homepage router
router.get('/',function(req, res) {
    res.render('home',{
                        title: "Dong hyo Ko,- enzoescipy\'s life challenge",
                    })
})

//notion testing router
router.get('/home',function(req, res) {
    const rendering = (value) => {
        console.log("(get) show data inside of mongoDB")
        var isDBloadSucced = "0"
        if (((req.url).includes("?")) )
        {
            isDBloadSucced = ((req.url).split("?"))[1].split("=")[1]
        }

        res.render('index',{
                            isdataloaded : isDBloadSucced,
                            showday_amount: value,
                            title: "Dong hyo Ko - enzoescipy's life challenge",
                            iam: "/home",
        })
    }

    const getscore = () => {
        var pythonProcess = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 1,propname,proprate,dbtype("human")])
        pythonProcess.stdout.on()
    }

    mongoSETTING.get(0,0,0,dbtype("mongo"),0,rendering )
})

//python test router
router.get('/home/rate_adjust', function(req, res) {
    res.render('set_rate', {iam: '/home/rate_adjust'})
})







//notion update router
router.post('/api/notionUpdate', function(req, res) {
    mongoPublic.reloadDB_main(0,0,dbtype("mongo"),(para) => {
        if (para == -1)
        {
            console.log("(request_1_denied) update data from notion -> server mongoDB, blocked by pre-settings ")
            res.render('warp', {portal: req.body.portal1, send: -1})
        }
        else
        {
            console.log("(request_) update data from notion -> server mongoDB ")
            res.render('warp', {portal: req.body.portal1, send: 1})
        }

    })
})

router.post('/api/SETTINGsSet/', function(req, res) {
    mongoSETTING.set(0,0,req.body.slider1,0,dbtype("mongo"),0,function() {
        console.log("(request_2) update local settings in server. ")
        res.render('warp', {portal: req.body.portal2})
    })
})

router.post('/api/ratesSet/', function(req, res) {
    //mongoCalc spawn
    var propname = req.body.prop_name
    var proprate = Number(req.body.rate_abs)
    var ignorance = Number(req.body.ignorance)

    console.log(propname, proprate, ignorance)
    var pythonProcess = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 0,propname,proprate,dbtype("human"),ignorance,"XXXX-XX-XX"])
    
    pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString())
        console.log("(request_3) update calculation rate_abs in server. ")
        res.render('warp', {portal: req.body.portal3})
    })
})


module.exports = router