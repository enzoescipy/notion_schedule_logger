const {MongoClient} = require ("mongodb")
const dbnaming = require('./mongod_dbmanage_Name')
const uri = "mongodb://localhost:27017"

const client = new MongoClient(uri);

const where = ["home","server"] 
const what = ["showday_amount","load_limit"]

async function set(wherenum, whatnum, value, dbNamenum,dbTypenum,collectionTypenum, callback)
{
    const whereprop = where[wherenum]
    const whatprop = what[whatnum]

    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,2, dbTypenum, collectionTypenum)

    await client.connect()

    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    var doc = {"what" : whatprop, "where" : whereprop, "value": value}

    await collec.replaceOne({"what" : whatprop, "where" : whereprop}, doc, {upsert : true} )

    await client.close()
    if (callback != null){callback()}
}

async function get(wherenum, whatnum,dbNamenum,dbTypenum,collectionTypenum, callback)
{
    const whereprop = where[wherenum]
    const whatprop = what[whatnum]

    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,2, dbTypenum, collectionTypenum)

    await client.connect()

    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    doc = await collec.findOne({"what" : whatprop, "where" : whereprop})
    
    if (callback != null){callback(doc["value"])}

    return doc["value"]

}

exports.get = get
exports.set = set