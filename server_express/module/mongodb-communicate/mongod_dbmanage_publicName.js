const { get } = require("jquery");
const {MongoClient} = require ("mongodb")
const uri = "mongodb://localhost:27017"


const NameDB = "NAMING_system"
const NameDB_collec = "base"
const NameDB_setting = "setting"


async function getDBnaming(dbNamenum, dbTypenum, collectionTypenum)
{
    const client = new MongoClient(uri);

    dbNamenum = Number(dbNamenum)
    dbVarinum = Number(dbVarinum)
    dbTypenum = Number(dbTypenum)
    collectionTypenum = Number(collectionTypenum)


    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    //get settings.
    var setting = await collec.find({'id':NameDB_setting})
    var setting_doc = await setting.next()

    const typeofDB = setting_doc.typeofDB
    const variofDB = setting_doc.variationofDB
    const typeofCollection = setting_doc.typeofCollection
    const nameofDB = setting_doc.nameofDB

    const dbType = typeofDB[dbTypenum]
    const dbVari = variofDB[dbVarinum]
    const collectionType = typeofCollection[collectionTypenum]
    const dbName = nameofDB[dbNamenum]
    var DBstring = dbName + "_" + dbVari + "_" + dbType


    var DBnamingDoc = await collec.find({'id':DBstring})
    var isexist_doc = await DBnamingDoc.next()
    client.close()
    if ( isexist_doc != null) 
    {
        return {"DB" : DBstring, "collection" : collectionType}
    }
    else
    {
        return -1
    }


}

exports.getDBnaming = getDBnaming