const { get } = require("jquery");
const {MongoClient} = require ("mongodb")
const uri = "mongodb://localhost:27017"

const client = new MongoClient(uri);

const NameDB = "NAMING_system"
const NameDB_collec = "base"
const NameDB_setting = "setting"



async function reset_setting()
{
    const nameofDB = ["NotionpageWorkId"]
    const typeofDB = ["test","main","backup","system"]
    const typeofCollection = ["todo"]

    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    var result = await collec.deleteMany({})
    console.log("\ndeleted" + result.deletedCount + " data first.\n")

    await collec.insertOne({'id':NameDB_setting, "nameofDB" : nameofDB, "typeofDB":typeofDB, "typeofCollection":typeofCollection})
    await client.close()
}

async function debug()
{
    console.log("(mongod_dbmanage) dbnamingDB inner emited.")
    var docSum = {}
    try
    {
        await client.connect()
        const database = client.db(NameDB)
        const collec = database.collection(NameDB_collec)
        const result = await collec.find()
        await result.forEach(function(doc){
            if (doc != null)
            {
                docSum[Object.keys(docSum).length] = doc
            }
        })
    }
    finally
    {
        await client.close()
    }

    console.log(docSum)

}

async function putDBnaming(dbNamenum, dbTypenum, collectionTypenum)
{
    dbNamenum = Number(dbNamenum)
    dbTypenum = Number(dbTypenum)
    collectionTypenum = Number(collectionTypenum)


    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    //get settings.
    var setting = await collec.find({'id':NameDB_setting})
    var setting_doc = setting.next()

    const typeofDB = setting_doc.typeofDB
    console.log(setting_doc)
    const typeofCollection = setting_doc.typeofCollection
    const nameofDB = setting_doc.nameofDB

    const dbType = typeofDB[dbTypenum]
    const collectionType = typeofCollection[collectionTypenum]
    const dbName = nameofDB[dbNamenum]

    //find if there is already db exists.
    var dbname = dbName + "_" + dbType
    var cursor =  await collec.find({'id':dbname})
    var doc = cursor.next()
    if (doc != null) 
    {
        var new_collec = doc['collections'].push(collectionType)
        await collec.updateOne({'id':dbname}, {$set: {'collections': new_collec }})
    } 
    else
    {
        var newdoc = {'id' : dbname, 'collections' : [collectionType]}
        await collec.insertOne(newdoc)
    }
    await client.close()
}

async function getDBnaming(dbNamenum, dbTypenum, collectionTypenum)
{
    dbNamenum = Number(dbNamenum)
    dbTypenum = Number(dbTypenum)
    collectionTypenum = Number(collectionTypenum)

    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    //get settings.
    var setting = await collec.find({'id':NameDB_setting})
    var setting_doc = setting.next()

    const typeofDB = setting_doc.typeofDB
    const typeofCollection = setting_doc.typeofCollection
    const nameofDB = setting_doc.nameofDB

    const dbType = typeofDB[dbTypenum]
    const collectionType = typeofCollection[collectionTypenum]
    const dbName = nameofDB[dbNamenum]

    return {"DB" : dbName + "_" + dbType, "collection" : collectionType}
}



exports.maindatabase = "Notionpage_workid"
exports.testdatabase = "Notionpage_workid_test"
exports.collection = ["todo"]

exports.reset_setting = reset_setting
exports.debug = debug
exports.putDBnaming = putDBnaming
exports.getDBnaming = getDBnaming