const {MongoClient} = require ("mongodb")
const uri = "mongodb://localhost:27017"
const DBnaming = require('./mongod_dbmanage_publicName')

const client = new MongoClient(uri);

async function find_test(callback)
{
    await client.connect()
    const dbname = DBnaming.getDBnaming(0,3,0)
    const database = client.db(dbname.DB)
    const test = database.collection(dbname.collection)
    var result = await test.findOne({})
    if (callback != null){callback(result)}
    return result
}

exports.find_test = find_test