const {MongoClient} = require ("mongodb")
const dbnaming = require('./mongod_dbmanage_Name')
const uri = "mongodb://localhost:27017"

const client = new MongoClient(uri);

const where = []
const what = []

async function set(wherenum, whatnum, value, dbNamenum,dbTypenum,collectionTypenum, callback)
{
    const whereprop = where[wherenum]
    const whatprop = what[whatnum]

    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)

    await client.connect()

    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    var doc = {"what" : whatprop, "where" : whereprop, "value": value}

    await collec.replaceOne({"what" : whatprop, "where" : whereprop}, doc, true )

    await client.close()
    if (callback != null){callback()}
}

async function get(dbNamenum,dbTypenum,collectionTypenum, callback)
{
    const whereprop = where[wherenum]
    const whatprop = what[whatnum]

    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)

    await client.connect()

    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    doc = await collec.findOne({"what" : whatprop, "where" : whereprop})
    
    if (callback != null){callback()}

    return doc["value"]

}

exports.get = get
exports.set = set