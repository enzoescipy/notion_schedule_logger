const mongoGenerate = require('./mongod_dbmanage_generate')



async function makeNewDBset(DB_namenum, collection_namenum)
{
    for (var i=0; i<4;i++)
    {
        console.log(i)
        await mongoGenerate.makeNewDB(DB_namenum,i,collection_namenum)
    }
}

async function reloadDB_main(DB_namenum, collection_namenum, callback)
{
    await mongoGenerate.update(DB_namenum,1,collection_namenum, callback)
}

async function generateDB_test(DB_namenum, collection_namenum, datestring, callback)
{
    await mongoGenerate.insertRandomDatepairs(DB_namenum,0,collection_namenum,datestring, callback)
}

async function saveDB_main(DB_namenum, collection_namenum, callback)
{
    await mongoGenerate.copypaste(DB_namenum,1,collection_namenum, DB_namenum,2,collection_namenum, callback)
}

async function takeDBfromBackUp_test(DB_namenum, collection_namenum, callback)
{
    await mongoGenerate.copypaste(DB_namenum,2,collection_namenum, DB_namenum,0,collection_namenum, callback)
}

exports.makeNewDBset = makeNewDBset
exports.reloadDB_main = reloadDB_main
exports.generateDB_test = generateDB_test
exports.saveDB_main = saveDB_main
exports.takeDBfromBackUp_test = takeDBfromBackUp_test