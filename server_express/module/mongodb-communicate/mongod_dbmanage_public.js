const mongoGenerate = require('./mongod_dbmanage_generate')
const mongoNameManage = require('./mongod_dbmanage_Name')
const mongoSETTINGs = require('./mongod_dbmanage_SETTINGs')

async function showSetting()
{
    mongoNameManage.show_setting()
}

async function makeNewDBset(dbNamenum,dbVarinum, collectionTypenum)
{
    for (var i=0; i<3;i++)
    {
        console.log(i)
        await mongoGenerate.makeNewDB(dbNamenum,dbVarinum, i, collectionTypenum)
    }
}

async function clearDBset(dbNamenum,dbVarinum, collectionTypenum)
{
    for (var i=0; i<3;i++)
    {
        console.log(i)
        await mongoGenerate.initialize(dbNamenum,dbVarinum, i, collectionTypenum)
    }
}

async function clear(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
{
    await mongoGenerate.initialize(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
}

async function delDBset(dbNamenum,dbVarinum, collectionTypenum)
{
    for (var i=0; i<3;i++)
    {
        console.log(i)
        await mongoGenerate.deleteSelf(dbNamenum,dbVarinum, i, collectionTypenum)
        await mongoNameManage.delDBnaming(dbNamenum,dbVarinum, i, collectionTypenum)
    }
}

async function reloadDB_main(dbNamenum,dbTypenum, collectionTypenum, callback)
{
    current_lock = await mongoSETTINGs.get(1,1,0,dbTypenum,0)
    if (current_lock == true)
    {
        if (callback != null){callback(-1)}
        return -1
    }
    else
    {
        await mongoGenerate.update_mainNotion(dbNamenum, dbTypenum, collectionTypenum, callback)
    }

}

async function generateDB_test(dbNamenum,dbVarinum, collectionTypenum, datestring, callback) // datestring means when to set today. if today is wed -> mon, tue, wed are saved.
{
    check = await mongoGenerate.insertRandomDatepairs(dbNamenum,dbVarinum, 0, collectionTypenum,datestring, callback)
    print(check)
}

async function saveDB_main(dbNamenum,dbVarinum, collectionTypenum, callback)
{
    await mongoGenerate.copypaste(dbNamenum,dbVarinum, 1, collectionTypenum, dbNamenum,dbVarinum, 2, collectionTypenum, callback)
}

async function takeDBfromBackUp_test(dbNamenum,dbVarinum, collectionTypenum, callback)
{
    await mongoGenerate.copypaste(dbNamenum,dbVarinum, 2, collectionTypenum, dbNamenum,dbVarinum, 0, collectionTypenum, callback)
}

async function debug(dbNamenum,dbVarinum, dbTypenum, collectionTypenum, callback)
{
    await mongoGenerate.debug(dbNamenum,dbVarinum, dbTypenum, collectionTypenum, callback)
}

async function debug_DBset(dbNamenum,dbVarinum, collectionTypenum, callback)
{
    var docSum = {}
    for (var i=0; i<3; i++)
    {
        docSum[Object.keys(docSum).length] = await mongoGenerate.debug(dbNamenum,dbVarinum, i, collectionTypenum)
    }
    if (callback != null)
    {
        callback(docSum)
    }
}

exports.makeNewDBset = makeNewDBset
exports.reloadDB_main = reloadDB_main
exports.generateDB_test = generateDB_test
exports.saveDB_main = saveDB_main
exports.takeDBfromBackUp_test = takeDBfromBackUp_test
exports.clearDBset = clearDBset
exports.clear = clear
exports.delDBset = delDBset
exports.debug = debug
exports.showSetting = showSetting
exports.debug_DBset = debug_DBset