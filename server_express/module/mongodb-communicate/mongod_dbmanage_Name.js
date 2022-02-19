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

    var result = await collec.deleteOne({'id':NameDB_setting})
    console.log("\ndeleted" + result.deletedCount + " data first.\n")

    await collec.insertOne({'id':NameDB_setting, "nameofDB" : nameofDB, "typeofDB":typeofDB, "typeofCollection":typeofCollection})
    await client.close()
}

async function add_setting(whichtoadd_num, adding_string) // 0 : nameofDB, 1 : typeofDB, 2 : typeofCollection
{
    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    var whichtoadd = "invaild"
    if (whichtoadd_num === 0)
    {
        whichtoadd = "nameofDB"
    }
    else if (whichtoadd_num === 1)
    {
        whichtoadd = "typeofDB"
    }
    else if (whichtoadd_num === 2)
    {
        whichtoadd = "typeofCollection"
    }
    
    var filter = {'id': NameDB_setting}
    var current_doc = collec.findOne(filter)
    var innerArray = current_doc[whichtoadd]
    innerArray.push(toString(adding_string))

    var update_doc = {$set: { [whichtoadd]:  innerArray}}
    await collec.updateOne(filter,update_doc,{})

    await client.close()
}

async function delete_setting(whichtodel_num,) // 0 : nameofDB, 1 : typeofDB, 2 : typeofCollection
{
    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    var whichtodel = "invaild"
    if (whichtodel_num === 0)
    {
        whichtodel = "nameofDB"
    }
    else if (whichtodel_num === 1)
    {
        whichtodel = "typeofDB"
    }
    else if (whichtodel_num === 2)
    {
        whichtodel = "typeofCollection"
    }

    var filter = {'id': NameDB_setting}
    var update_doc = {$unset:  [whichtodel] }
    await collec.updateOne(filter,update_doc,{})

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
    var setting_doc = await setting.next()

    const typeofDB = setting_doc.typeofDB
    const typeofCollection = setting_doc.typeofCollection
    const nameofDB = setting_doc.nameofDB

    const dbType = typeofDB[dbTypenum]
    const collectionType = typeofCollection[collectionTypenum]
    const dbName = nameofDB[dbNamenum]

    //find if there is already db exists.
    var dbname = dbName + "_" + dbType
    var cursor =  await collec.find({'id':dbname})
    var doc = await cursor.next()
    if (doc != null) 
    {
        for (index in doc.collection)
        {
            var colec = doc.collection[index]
            if ( colec === collectionType )
            {
                return -1
            }
        }
        doc.collections.push(collectionType)
        await collec.updateOne({'id':dbname}, {$set: {'collections': doc.collections }})
    } 
    else
    {
        var collecArray = Array()
        collecArray.push(collectionType)
        var newdoc = {'id' : dbname, 'collections' : collecArray}
        await collec.insertOne(newdoc)
    }
    await client.close()
}

async function delDBnaming(dbNamenum, dbTypenum, collectionTypenum)
{
    dbNamenum = Number(dbNamenum)
    dbTypenum = Number(dbTypenum)
    collectionTypenum = Number(collectionTypenum)


    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    //get settings.
    var setting = await collec.find({'id':NameDB_setting})
    var setting_doc = await setting.next()

    const typeofDB = setting_doc.typeofDB
    const typeofCollection = setting_doc.typeofCollection
    const nameofDB = setting_doc.nameofDB

    const dbType = typeofDB[dbTypenum]
    const collectionType = typeofCollection[collectionTypenum]
    const dbName = nameofDB[dbNamenum]

    //find if there is already db exists.
    var dbname = dbName + "_" + dbType
    var cursor =  await collec.find({'id':dbname})
    var doc = await cursor.next()
    if (doc != null) 
    {
        await collec.deleteOne({"id":dbname})
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
    var setting_doc = await setting.next()

    const typeofDB = setting_doc.typeofDB
    const typeofCollection = setting_doc.typeofCollection
    const nameofDB = setting_doc.nameofDB

    const dbType = typeofDB[dbTypenum]
    const collectionType = typeofCollection[collectionTypenum]
    const dbName = nameofDB[dbNamenum]
    const DBstring = dbName + "_" + dbType


    var DBnamingDoc = await collec.find({'id':DBstring})
    var isexist_doc = await DBnamingDoc.next()
    if ( isexist_doc != null) 
    {
        console.log(isexist_doc)
        return {"DB" : DBstring, "collection" : collectionType}
    }
    else
    {
        return -1
    }


}



exports.maindatabase = "Notionpage_workid"
exports.testdatabase = "Notionpage_workid_test"
exports.collection = ["todo"]

exports.reset_setting = reset_setting
exports.debug = debug
exports.putDBnaming = putDBnaming
exports.getDBnaming = getDBnaming
exports.delDBnaming = delDBnaming

exports.delete_setting = delete_setting
exports.add_setting = add_setting