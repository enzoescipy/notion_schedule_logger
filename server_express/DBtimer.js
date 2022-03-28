const spawn = require("child_process").spawn
const publicMongo = require("./module/mongodb-communicate/mongod_dbmanage_public")
const settingMongo = require("./module/mongodb-communicate/mongod_dbmanage_SETTINGs")
const moment = require('moment');
const istest = require("./module/serverIsTest/index")
require("moment-timezone")
moment.tz.setDefault("Asia/Seoul")


var preset_DBnaming = []
var preset_repeat_ms = 0
var initrate = undefined
var initignorance = undefined

var ispreset_addDB_raised = false
async function preset_addDB(dbNamenum, dbTypenum, collectionTypenum)
{
    preset_DBnaming.push([dbNamenum, dbTypenum, collectionTypenum])
    ispreset_addDB_raised = true
    return preset_DBnaming
}
var ispreset_repeatTime_raised = false
async function preset_addRepeatTime(sec)
{
    preset_repeat_ms = Number(sec) * 1000
    ispreset_repeatTime_raised = true
    return preset_repeat_ms
}
var ispreset_initial_ratesetting_raised = false
async function preset_initial_ratesetting(rate, igno)
{
    initrate = Number(rate)
    initignorance = Number(igno)
    ispreset_initial_ratesetting_raised = true
    return [initrate,initignorance]
}


async function init_test()
{
    for (let i=0; i<preset_DBnaming.length; i++)
    {
        var DBnaming = preset_DBnaming[i]
        var DBnaming_0 = DBnaming[0]
        var DBnaming_1 = DBnaming[1]
        var DBnaming_2 = DBnaming[2]
        //mongo init
        console.log("settingDB...")
        await settingMongo.set(1,1,false,DBnaming_0,DBnaming_1,DBnaming_2)
        await settingMongo.set(0,0,7,DBnaming_0,DBnaming_1,DBnaming_2)
        console.log("notionMainDB...")
        await publicMongo.reloadDB_main(DBnaming_0,DBnaming_1,DBnaming_2)
    }
}

async function repeat_test()
{
    for (let i=0; i<preset_DBnaming.length; i++)
    {
        var DBnaming = preset_DBnaming[i]
        var DBnaming_0 = DBnaming[0]
        var DBnaming_1 = DBnaming[1]
        var DBnaming_2 = DBnaming[2]
        console.log("notionMainDB...")
        await publicMongo.reloadDB_main(DBnaming_0,DBnaming_1,DBnaming_2)

    }

}

async function init(callback)
{
    for (let i=0; i<preset_DBnaming.length; i++)
    {
        var DBnaming = preset_DBnaming[i]
        var DBnaming_0 = DBnaming[0]
        var DBnaming_1 = DBnaming[1]
        var DBnaming_2 = DBnaming[2]
        //mongo init
        console.log("settingDB...")
        await settingMongo.set(1,1,false,DBnaming_0,DBnaming_1,DBnaming_2)
        await settingMongo.set(0,0,7,DBnaming_0,DBnaming_1,DBnaming_2)
        console.log("notionMainDB...")
        await publicMongo.reloadDB_main(DBnaming_0,DBnaming_1,DBnaming_2)

        //python init
        var pythonprocess_1 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 1,DBnaming_0,DBnaming_2,DBnaming_1,initrate,initignorance])
        console.log("pyProprateNewAdd...")
        pythonprocess_1.on('close', chain1)
        function chain1(data)
        {
            console.log(data)
            console.log("pyCalculaionNewAdd...")
            var pythonprocess_2 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 2,DBnaming_0,DBnaming_2,DBnaming_1])
            pythonprocess_2.on('close', chain2)
        }
        function chain2(data)
        {
            console.log(data)
            console.log("pycmmulativeNewAdd...")
            var pythonprocess_4 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 4,DBnaming_0,DBnaming_2,DBnaming_1])
            pythonprocess_4.on('close',chain3 )
        }
        function chain3(data)
        {
            console.log(data)
            console.log("initiation end.")
            console.log("loop start.") 
            callback()
        }

    }
}

async function repeat()
{
    for (let i=0; i<preset_DBnaming.length; i++)
    {
        var DBnaming = preset_DBnaming[i]
        var DBnaming_0 = DBnaming[0]
        var DBnaming_1 = DBnaming[1]
        var DBnaming_2 = DBnaming[2]
        console.log(i,DBnaming)
        console.log("notionMainDB...")
        await publicMongo.reloadDB_main(DBnaming_0,DBnaming_1,DBnaming_2)
        todaystring = await istest.TESTDATE_GET()
        if (todaystring === -1)
        {
            todaystring = moment().format("YYYY-MM-DD")
        }
        var pythonprocess_1 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 1,DBnaming_0,DBnaming_2,DBnaming_1,initrate,initignorance])
        console.log("pyProprateNewAdd...")
        pythonprocess_1.on('close', chain1)
        function chain1(data)
        {
            console.log(data)
            console.log("pyCalculaionNewAdd...")
            console.log(i, DBnaming_0,DBnaming_2,DBnaming_1)
            var pythonprocess_2 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 2,DBnaming_0,DBnaming_2,DBnaming_1])
            pythonprocess_2.on('close', chain2)
        }
        function chain2(data)
        {
            console.log(data)
            console.log("pycmmulativeNewAdd...")
            var pythonprocess_4 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 4,DBnaming_0,DBnaming_2,DBnaming_1])
            pythonprocess_4.on('close',chain3 )
        }
        function chain3(data)
        {
            console.log(data)
            console.log("pyCalculation_WeekCommulative_and_TodayPoint...")
            var pythonprocess_3 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py",3,DBnaming_0,DBnaming_2,todaystring,DBnaming_1])
            pythonprocess_3.on('close', chain4)
        }
        function chain4(data)
        {
            console.log(data)
            console.log("initiation end.")
            console.log("loop start.") 
        }
    }

}

async function infinite_repeat()
{
    console.log("loop. log the time inside DB setting.")
    //logging looped time to db.
    for (let i=0; i<preset_DBnaming.length; i++)
    {
        var DBnaming = preset_DBnaming[i]
        var DBnaming_0 = DBnaming[0]
        var DBnaming_1 = DBnaming[1]
        var DBnaming_2 = DBnaming[2]
        await settingMongo.set(1,2,moment().format(),DBnaming_0,DBnaming_1,DBnaming_2)
    }
    setTimeout(repeat, preset_repeat_ms)
    setTimeout(infinite_repeat, preset_repeat_ms)
}

async function just_log_repeat()
{
    console.log("loop. log the time inside DB setting.")
    //logging looped time to db.
    for (let i=0; i<preset_DBnaming.length; i++)
    {
        var DBnaming = preset_DBnaming[i]
        var DBnaming_0 = DBnaming[0]
        var DBnaming_1 = DBnaming[1]
        var DBnaming_2 = DBnaming[2]
        await settingMongo.set(1,2,moment().format(),DBnaming_0,DBnaming_1,DBnaming_2)
    }
    await repeat()
}

async function START()
{
    if ( !(ispreset_addDB_raised && ispreset_repeatTime_raised))
    {
        console.log(ispreset_addDB_raised && ispreset_repeatTime_raised)
        console.log("fault. setting not completed.")
        return -1
    }
    console.log("initiation start.")
    await init(infinite_repeat)
   
}

async function START_onlyOnce()
{
    if ( !(ispreset_addDB_raised && ispreset_repeatTime_raised))
    {
        console.log(ispreset_addDB_raised && ispreset_repeatTime_raised)
        console.log("fault. setting not completed.")
        return -1
    }
    console.log("initiation start.")
    await init(just_log_repeat)
}


exports.preset_addDB = preset_addDB
exports.preset_addRepeatTime = preset_addRepeatTime
exports.preset_initial_ratesetting = preset_initial_ratesetting
exports.START = START
exports.START_onlyOnce = START_onlyOnce