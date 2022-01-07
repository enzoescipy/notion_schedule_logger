const {MongoClient} = require ("mongodb")
const uri = "mongodb://localhost:27017"

const client = new MongoClient(uri);

async function find_test(callback)
{
    await client.connect()
    const database = client.db("PythonCalculation")
    const test = database.collection("test")
    var result = await test.findOne({})
    if (callback != null){callback(result)}
}

exports.find_test = find_test