const mongoGenerate = require('./mongod_dbmanage_generate')
const mongoNameManage = require('./mongod_dbmanage_Name')
const mongoSETTINGs = require('./mongod_dbmanage_SETTINGs')

async function showSetting()
{
    mongoNameManage.show_setting()
}

async function getcollecSettings()
{
    return await mongoNameManage.show_setting_collec()
}

async function makeNewDBset(dbNamenum, collectionTypenum)
{
    for (let vari=0; vari<3; vari++)
    {
        for (var i=0; i<3;i++)
        {
            console.log(i)
            await mongoGenerate.makeNewDB(dbNamenum,vari, i, collectionTypenum)
        }
    }
}

async function clearTests(dbNamenum, collectionTypenum)
{
    for (var i=0; i<3;i++)
    {
        await mongoGenerate.initialize(dbNamenum,i, 0, collectionTypenum)
    }
}

async function clearMains(dbNamenum, collectionTypenum)
{
    for (var i=0; i<3;i++)
    {
        await mongoGenerate.initialize(dbNamenum,i, 1, collectionTypenum)
    }
}

async function clearBackups(dbNamenum, collectionTypenum)
{
    for (var i=0; i<3;i++)
    {
        await mongoGenerate.initialize(dbNamenum,i, 2, collectionTypenum)
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
exports.clear = clear
exports.clearTests = clearTests
exports.clearMains = clearMains
exports.clearBackups = clearBackups
exports.delDBset = delDBset
exports.debug = debug
exports.showSetting = showSetting
exports.debug_DBset = debug_DBset
exports.getcollecSettings = getcollecSettings