const spawn = require("child_process").spawn
const publicMongo = require("./module/mongodb-communicate/mongod_dbmanage_public")
const settingMongo = require("./module/mongodb-communicate/mongod_dbmanage_SETTINGs")
const moment = require('moment');
require("moment-timezone")
moment.tz.setDefault("Asia/Seoul")
const todaystring = moment().format("YYYY-MM-DD")

var preset_DBnaming = []
var preset_repeat_ms = 0

var ispreset_addDB_raised = false
async function preset_addDB(dbNamenum, dbTypenum, collectionTypenum)
{
    preset_DBnaming.push([dbNamenum, dbTypenum, collectionTypenum])
    ispreset_addDB_raised = true
}
var ispreset_repeatTime_raised = false
async function preset_addRepeatTime(ms)
{
    preset_repeat_ms = ms
    ispreset_repeatTime_raised = true
}


async function init()
{
    for (let i=0; i<preset_DBnaming.length; i++)
    {
        var DBnaming = preset_DBnaming[i]
        //mongo init
        await publicMongo.reloadDB_main(DBnaming[0],DBnaming[1],DBnaming[2])
        await settingMongo.set(1,1,true,DBnaming[0],DBnaming[1],DBnaming[2])
        //python init
        var pythonprocess_1 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 1,DBnaming[0],DBnaming[2],DBnaming[1],proprate,ignorance])
        var pythonprocess_2 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 2,DBnaming[0],DBnaming[2],DBnaming[1]])
        var pythonprocess_4 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py", 4,DBnaming[0],DBnaming[2],DBnaming[1]])

        pythonprocess_1.stdout.on('data', chain1)
        function chain1(data)
        {
            pythonprocess_2.stdout.on('data', chain2)
        }
        function chain2(data)
        {
            pythonprocess_4.stdout.on('data',()=>{} )
        }

    }
}

async function repeat()
{
    for (let i=0; i<preset_DBnaming.length; i++)
    {
        var DBnaming = preset_DBnaming[i]
        await publicMongo.reloadDB_main(DBnaming[0],DBnaming[1],DBnaming[2])
        var pythonprocess_3 = spawn('./python3-server/bin/python', ["./module/mongoCalc/main.py",3,DBnaming[0],DBnaming[2],todaystring,DBnaming[1]])
        pythonprocess_3.stdout.on('data', () => {})
    }

}

async function infinite_repeat()
{
    setTimeout(repeat, preset_repeat_ms)
    setTimeout(infinite_repeat, preset_repeat_ms)
}

async function START()
{
    if ( (ispreset_addDB_raised && ispreset_repeatTime_raised))
    {
        console.log("fault. setting not completed.")
        return -1
    }
    await init()

    infinite_repeat()
}



exports.preset_addDB = preset_addDB
exports.preset_addRepeatTime = preset_addRepeatTime
exports.START = START