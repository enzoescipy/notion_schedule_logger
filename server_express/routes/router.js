const express = require('express')
const router = express.Router()
const mongoPublic = require("../module/mongodb-communicate/mongod_dbmanage_public")
const mongoSETTING = require("../module/mongodb-communicate/mongod_dbmanage_SETTINGs")
const mongoFront = require("../module/mongodb-frontend/mongod_dbtakeout_calculation")

var dbtype_fixed = "test"
function dbtype()
{
    if (dbtype_fixed == "test")
    {
        return 0
    }
    else if (dbtype_fixed == "main")
    {
        return 1
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

//main page router
router.get('/home', home_rendernow)
async function home_rendernow(req, res)
{
    var dataset = {
        mainScoreData_index : undefined,
        mainScoreData_main : undefined,
        isdataloaded : undefined,
        showday_amount: undefined,
        title: "Dong hyo Ko - enzoescipy's life challenge",
        iam: "/home", }
    
    mainScoreData = await home_get_mainScoreData(0,dbtype(),0)
    dataset["mainScoreData_index"] = JSON.stringify(mainScoreData["index"])
    console.log(dataset["mainScoreData_index"])
    dataset["mainScoreData_main"] = JSON.stringify(mainScoreData["data"])

    dataset["isdataloaded"] = await home_get_isdataloaded(req)

    dataset["showday_amount"] = await home_get_showday_amount(0,0,0,dbtype(),0)

    res.render('index',dataset)
}

async function home_get_mainScoreData(dbNamenum, dbTypenum, collectionTypenum)
{
    var organized_table = await mongoFront.calc_pointer_reOrganize(dbNamenum, dbTypenum, collectionTypenum)
    return organized_table
}

async function home_get_isdataloaded(req)
{
    var isDBloadSucced = "0"
    if (((req.url).includes("?")) )
    {
        isDBloadSucced = ((req.url).split("?"))[1].split("=")[1]
    }
    return isDBloadSucced
}

async function home_get_showday_amount(wherenum, whatnum,dbNamenum,dbTypenum,collectionTypenum)
{
    return await mongoSETTING.get(wherenum, whatnum,dbNamenum,dbTypenum,collectionTypenum)
}



//python test router
router.get('/home/rate_adjust', function(req, res) {
    res.render('set_rate', {iam: '/home/rate_adjust'})
})







//notion update router
router.post('/api/notionUpdate', function(req, res) {
    mongoPublic.reloadDB_main(0,0,dbtype(),(para) => {
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
    mongoSETTING.set(0,0,req.body.slider1,0,dbtype(),0,function() {
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
    var pythonProcess = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 0,propname,proprate,dbtype(),ignorance,"XXXX-XX-XX"])
    
    pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString())
        console.log("(request_3) update calculation rate_abs in server. ")
        res.render('warp', {portal: req.body.portal3})
    })
})


module.exports = router