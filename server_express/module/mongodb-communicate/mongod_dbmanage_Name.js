const { get } = require("jquery");
const {MongoClient} = require ("mongodb")
const uri = "mongodb://localhost:27017"


const NameDB = "NAMING_system"
const NameDB_collec = "base"
const NameDB_setting = "setting"

async function show_setting()
{
    const client = new MongoClient(uri);

    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)


    //get settings.
    var setting = await collec.find({'id':NameDB_setting})
    var setting_doc = await setting.next()
    console.log(setting_doc)
    client.close()
}

async function show_setting_collec()
{
    const client = new MongoClient(uri);

    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)


    //get settings.
    var setting = await collec.find({'id':NameDB_setting})
    var setting_doc = await setting.next()

    client.close()
    return setting_doc["typeofCollection"]
}

async function reset_setting()
{
    const client = new MongoClient(uri);

    const nameofDB = ["NotionpageWorkId"]
    const variationofDB = ["notion","calculate","system"]
    const typeofDB = ["test","main","backup"]
    const typeofCollection = ["todo", "study", "cat", "projects"]

    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    var result = await collec.deleteOne({'id':NameDB_setting})

    await collec.insertOne({'id':NameDB_setting, "nameofDB" : nameofDB, "typeofDB":typeofDB,"variationofDB":variationofDB, "typeofCollection":typeofCollection})
    client.close()
}

async function add_setting(whichtoadd_num, adding_string) // 0 : nameofDB,1:variationofDB, 2 : typeofDB, 3 : typeofCollection
{
    const client = new MongoClient(uri);

    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    var whichtoadd = "invaild"
    if (whichtoadd_num === 0)
    {
        whichtoadd = "nameofDB"
    }
    else if (whichtoadd_num == 1)
    {
        whichtoadd = "variationofDB"
    }
    else if (whichtoadd_num === 2)
    {
        whichtoadd = "typeofDB"
    }
    else if (whichtoadd_num === 3)
    {
        whichtoadd = "typeofCollection"
    }
    
    var filter = {'id': NameDB_setting}
    var current_doc = await collec.findOne(filter)
    var innerArray = current_doc[whichtoadd]
    innerArray.push(String(adding_string))

    var update_doc = {$set: { [whichtoadd]:  innerArray}}
    await collec.updateOne(filter,update_doc,{})

    client.close()
}

async function delete_setting(whichtodel_num, proptodel_string) // 0 : nameofDB, 1 : typeofDB, 2 : typeofCollection
{
    const client = new MongoClient(uri);

    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    var whichtodel = "invaild"
    if (whichtoadd_num === 0)
    {
        whichtoadd = "nameofDB"
    }
    else if (whichtoadd_num == 1)
    {
        whichtoadd = "variationofDB"
    }
    else if (whichtoadd_num === 2)
    {
        whichtoadd = "typeofDB"
    }
    else if (whichtoadd_num === 3)
    {
        whichtoadd = "typeofCollection"
    }

    var filter = {'id': NameDB_setting}
    var current_doc = await collec.findOne(filter)
    var innerArray = current_doc[whichtodel]

    proptodel_string = String(proptodel_string)
    var propindex = innerArray.indexOf(proptodel_string)
    innerArray.splice(propindex, 1)

    var update_doc = {$set: { [whichtodel]:  innerArray}}
    await collec.updateOne(filter,update_doc,{})

    client.close()
}

async function debug()
{
    const client = new MongoClient(uri);

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
        client.close()
    }

    console.log(docSum)
}

async function putDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
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

    //find if there is already db exists.
    var dbname = dbName + "_" + dbVari + "_" + dbType
    var cursor =  await collec.find({'id':dbname})
    var doc = await cursor.next()
    if (doc != null) 
    {
        for (index in doc.collections)
        {
            var colec = doc.collections[index]
            if ( colec === collectionType )
            {
                console.log('there is already same document.')
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
    client.close()
}

async function delDBnaming_super(target_string)
{
    const client = new MongoClient(uri);

    await client.connect()
    const database = client.db(NameDB)
    const collec = database.collection(NameDB_collec)

    //get settings.
    var setting = await collec.find({'id':NameDB_setting})
    var setting_doc = await setting.next()
    var dbname = target_string
    var cursor =  await collec.find({'id':dbname})
    var doc = await cursor.next()
    if (doc != null) 
    {
        await collec.deleteOne({"id":dbname})
    } 
    client.close()
}

async function delDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
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
    //find if there is already db exists.
    var dbname = dbName + "_" + dbVari + "_" + dbType
    var cursor =  await collec.find({'id':dbname})
    var doc = await cursor.next()
    if (doc != null) 
    {
        await collec.deleteOne({"id":dbname})
    } 
    client.close()
}
async function getDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
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
    if ( isexist_doc != null) 
    {
        return {"DB" : DBstring, "collection" : collectionType}
    }
    else
    {
        return -1
    }


}


exports.reset_setting = reset_setting
exports.debug = debug
exports.putDBnaming = putDBnaming
exports.getDBnaming = getDBnaming
exports.delDBnaming = delDBnaming
exports.delDBnaming_super = delDBnaming_super

exports.delete_setting = delete_setting
exports.add_setting = add_setting
exports.show_setting = show_setting

exports.show_setting_collec = show_setting_collec