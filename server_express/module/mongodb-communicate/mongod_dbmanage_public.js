const mongoGenerate = require('./mongod_dbmanage_generate')



async function makeNewDBset(DB_namenum, collection_namenum)
{
    for (var i=0; i<3;i++)
    {
        await mongoGenerate.makeNewDB(DB_namenum,i,collection_namenum)
    }
}

async function reloadDB_main(DB_namenum, collection_namenum)
{
    await mongoGenerate.update(DB_namenum,1,collection_namenum)
}

async function generateDB_test(DB_namenum, collection_namenum)
{
    await mongoGenerate.insertRandomDatepairs(DB_namenum,0,collection_namenum)
}

async function saveDB_main(DB_namenum, collection_namenum)
{
    await mongoGenerate.copypaste(DB_namenum,1,collection_namenum, DB_namenum,2,collection_namenum)
}

async function takeDBfromBackUp_test(DB_namenum, collection_namenum)
{
    await mongoGenerate.copypaste(DB_namenum,2,collection_namenum, DB_namenum,0,collection_namenum)
}

exports.makeNewDBset = makeNewDBset
exports.reloadDB_main = reloadDB_main
exports.generateDB_test = generateDB_test
exports.saveDB_main = saveDB_main
exports.takeDBfromBackUp_test = takeDBfromBackUp_test