const {MongoClient} = require ("mongodb")
const uri = "mongodb://localhost:27017"

const client = new MongoClient(uri);


const NameDB = "OPERATION_MODE_system"
const NameDB_collec = "base"

async function TEST()
{
    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)
    var todaystring = moment().format("YYYY-MM-DD")
    await collec.replaceOne({"currentMode":{'$exists': 1}}, {"currentMode":0, "testdate":todaystring}, {upsert:true})

    await client.close()
}

async function MAIN()
{
    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    await collec.replaceOne({"currentMode":{'$exists': 1}}, {"currentMode":1}, {upsert:true})
    await client.close()
}

async function BACKUP()
{
    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    await collec.replaceOne({"currentMode":{'$exists': 1}}, {"currentMode":2}, {upsert:true})
    await client.close()
}

async function NOWNUM()
{
    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)
    doc = await collec.findOne({})
    await client.close()
    return doc["currentMode"]
}

async function TESTDATE(datestring) //testdate would be destroy call the : MAIN, BACKUP
{
    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)
    await collec.replaceOne({"currentMode":{'$exists': 1}}, {"currentMode":0, "testdate":datestring}, {upsert:true})
    await client.close()
}
async function TESTDATE_GET()
{
    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)
    doc = await collec.findOne({})
    if (doc != null && "testdate" in doc)
    {
        await client.close()
        return doc["testdate"]
    }
    else
    {
        await client.close()
        return -1
    }
}
exports.TEST = TEST
exports.MAIN = MAIN
exports.BACKUP = BACKUP
exports.NOWNUM = NOWNUM
exports.TESTDATE = TESTDATE
exports.TESTDATE_GET = TESTDATE_GET
