const express = require('express')
const router = express.Router()
const mongoPublic = require("../module/mongodb-communicate/mongod_dbmanage_public")
const mongoSETTING = require("../module/mongodb-communicate/mongod_dbmanage_SETTINGs")
const mongoFront = require("../module/mongodb-frontend/mongod_dbtakeout_calculation")
const istest = require("../module/serverIsTest/index")
const moment = require("moment")
const fs = require('fs');

var dbtype = istest.NOWNUM
var todaystring = moment().format("YYYY-MM-DD")
var nowCollecNum = 0



var spawn = require("child_process").spawn

function writeLog(...args)
{
    strSum = ""
    for (let i=0; i<args.length; i++)
    {
        strSum += (args[i]).toString()
    }
    thismoment = moment().format()

    textss = thismoment+":"+strSum+"\n"
    console.log(textss)

    fs.appendFileSync('server_log.txt', textss);

}

//homepage router
router.get('/',function(req, res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    writeLog("(/) user "+ip.toString()+" accessed.")
    res.render('home',{
                        title: "Dong hyo Ko,- enzoescipy\'s life challenge",
                    })
})

//main page router
router.get('/home', home_rendernow)
async function home_rendernow(req, res)
{
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    //block other ip not me
    if (ip ==! "::ffff:119.207.27.39")
    {
        res.status(500).send("500 something wrong...")
        return
    }
    writeLog("(/home) user "+ip.toString()+" accessed.")
    var dataset = {
        mainScoreData_index : undefined,
        mainScoreData_main : undefined,
        mainScoreData_commulative : undefined,
        isdataloaded : undefined,
        showday_amount: undefined,
        collec: undefined,
        title: "Dong hyo Ko - enzoescipy's life challenge",
        iam: "/home", }
    dbtype_fixed = await dbtype()
    mainScoreData = await home_get_mainScoreData(0,dbtype_fixed,nowCollecNum)
    dataset["mainScoreData_index"] = JSON.stringify(mainScoreData["index"])
    dataset["mainScoreData_main"] = JSON.stringify(mainScoreData["data"])
    dataset["mainScoreData_commulative"] = JSON.stringify(mainScoreData["commulative"])

    dataset["isdataloaded"] = await home_get_isdataloaded(req)

    dataset["showday_amount"] = await home_get_showday_amount(0,0,0,dbtype_fixed,nowCollecNum)

    dataset["collec"] = JSON.stringify(await home_get_collec())

    res.render('index',dataset)
}

async function home_get_collec()
{
    var setting = await mongoPublic.getcollecSettings()
    return setting
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


//rate_adjust router

router.get('/home/rate_adjust', rate_rendernow)

async function rate_rendernow(req, res)
{
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    writeLog("(/home/rate_adjust) user "+ip.toString()+" accessed.")
    var dataset = { iam: '/home/rate_adjust',
                    rateData: undefined,    
                }
    dbtype_fixed = await dbtype()
    dataset["rateData"] = JSON.stringify(await rate_get_rateData(0,dbtype_fixed,nowCollecNum))

    res.render("set_rate", dataset)
}

async function rate_get_rateData(dbNamenum, dbTypenum, collectionTypenum)
{
    return await mongoFront.calc_rate_organize(dbNamenum, dbTypenum, collectionTypenum)
}

   

//notion update router
router.post('/api/notionUpdate', function(req, res) {
    async function calculate()
    {
        dbtype_fixed = await dbtype()
        var para = await mongoSETTING.get(1,2,0,dbtype_fixed,nowCollecNum)
        renderstart(para)
    }

    function renderstart(para)
    {
        if (para == -1)
        {
            writeLog("(request_1_denied) no log has found. ")
            res.render('warp', {portal: req.body.portal1, send: -1})
        }
        else
        {
            writeLog("(request_1) data has been updated since :",para)
            res.render('warp', {portal: req.body.portal1, send: para})
        }

    }

    calculate()
})

router.post('/api/SETTINGsSet/', async function(req, res) {
    dbtype_fixed = await dbtype()
    mongoSETTING.set(0,0,req.body.slider1,0,dbtype_fixed,nowCollecNum,function() {
        writeLog("(request_2) update local settings in server. ")
        res.render('warp', {portal: req.body.portal2})
    })
})

router.post('/api/ratesSet/', async function(req, res) {
    //mongoCalc spawn
    var propname = req.body.prop_name
    var proprate = Number(req.body.rate_abs)
    var ignorance = Number(req.body.ignorance)
    dbtype_fixed = await dbtype()
    var pythonProcess = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 0,0,nowCollecNum,propname,proprate,dbtype_fixed,ignorance,"XXXX-XX-XX"])
    
    pythonProcess.stdout.on('data', (data) => {
        writeLog("(request_3) update calculation rate_abs in server. ")
        res.render('warp', {portal: req.body.portal3})
    })
})

router.post('/api/collecSet/', async function (req, res) {
    var selectedCollec = Number(req.body.collec_num)
    nowCollecNum = selectedCollec
    writeLog("(request_4) changed showing collection. ")
    res.render('warp', {portal: req.body.portal4})
})


module.exports = router