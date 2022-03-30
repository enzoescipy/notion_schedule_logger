const {MongoClient} = require ("mongodb")
const Notion = require('../notion-communicate/index')
const dbnaming = require('./mongod_dbmanage_Name')
const uri = "mongodb://localhost:27017"


async function makeNewDB(dbNamenum,dbVarinum, dbTypenum, collectionTypenum, callback)
{
    var isSame = await dbnaming.putDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
    if ( isSame === -1 ) {return -1}
    await initialize(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
    if (callback != null){callback()}
}

async function insertRandomDatepairs(dbNamenum,dbVarinum, dbTypenum, collectionTypenum,datestring, callback)
{

    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
    const client = new MongoClient(uri);
    
    try
    {
        await client.connect()
        const database = client.db(seleted_dbnaming.DB)
        const collec = database.collection(seleted_dbnaming.collection)
        
        //get date data.
        var getID = await Notion.getIDfromCollecNum(dbNamenum,collectionTypenum)
        var calender = await Notion.testsetget_passorfail(getID,datestring)
        if (calender == -1) {client.close(); return -1 }
        for (key in calender)
        {
            //get date data.
            var date_data_now = calender[key] //(days in weeks) : (did or not boolean) obj.
            date_id = date_data_now.id // what i did. ex) study math
            delete date_data_now.id

            //check if there are already data that has same date_id exist in DB.
            var query = {"id" : date_id}
            var cursor = await collec.find(query) //document cursor. contains 'many'{ id : date_id, date1:true/false,  date2:true/false, ...}
            async function iter_dbrewrite(doc)
            {
                try
                {
                    if (doc != null) 
                    {
                        var date_data_db = doc // the {date1 : true, date2 : false, ...}
                        var id_db = doc.id
                        delete date_data_db.id
                        //compare the _now date and db's date.
                        for (date_now in date_data_now)
                        {
                            var update_doc
                            var filter
                            var did_now = date_data_now[date_now]
                            update_doc = {$set: { [date_now]: did_now }}
                            filter = {"id":id_db} //update 
                            var result = await collec.updateOne(filter, update_doc) //it can be done as asynchronously BUT for now, synchronous action.
                        }
                    }
                    else
                    {
                        //if there is no date_id(study) in the database, create a new document.
                        date_data_now.id = date_id
                        await collec.insertOne(date_data_now)
                    }
                }
                finally{}
            }
            
            var doc = await cursor.next()
            await iter_dbrewrite(doc)   
        }
    }
    finally
    {
        debug(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
        await client.close();
    }
    if (callback != null){callback()}
}

async function copypaste(dbNamenum1,dbVarinum1, dbTypenum1, collectionTypenum1,dbNamenum2,dbVarinum2, dbTypenum2, collectionTypenum2, callback)     
{
    seleted_dbnaming1 = await dbnaming.getDBnaming(dbNamenum1,dbVarinum1, dbTypenum1, collectionTypenum1)
    seleted_dbnaming2 = await dbnaming.getDBnaming(dbNamenum2,dbVarinum2, dbTypenum2, collectionTypenum2)
    const client = new MongoClient(uri);
    
    try
    {
        // basic connection
        await client.connect()
        const database1 = client.db(seleted_dbnaming1.DB)
        const collec1 = database1.collection(seleted_dbnaming1.collection)
        const database2 = client.db(seleted_dbnaming2.DB)
        const collec2 = database2.collection(seleted_dbnaming2.collection)


        //get the copied DB doc.
        var original_db_all = collec1.find()

        //remove all of document in pasting DB.    
        var result = await collec2.deleteMany({})

        //write document to pasting DB
        while (true)
        {
            var doc = await original_db_all.next()
            if (doc != null)
            {
                await collec2.insertOne(doc)
            }
            else
            {
                break
            }

        }

    }
    finally
    {
        await client.close();
    }
    if (callback != null){callback()}
}

async function deleteSelf(dbNamenum,dbVarinum, dbTypenum, collectionTypenum, callback)     
{
    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
    const client = new MongoClient(uri);
    
    try
    {
        // basic connection
        await client.connect()
        const database = client.db(seleted_dbnaming.DB)

        //drop database
        await database.dropDatabase()

    }
    finally
    {
        await client.close();
    }
    if (callback != null){callback()}
}

async function initialize(dbNamenum,dbVarinum, dbTypenum, collectionTypenum, callback)
{
    const client = new MongoClient(uri);

    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
    try
    {
        await client.connect()
        const database = client.db(seleted_dbnaming.DB)
        const collec = database.collection(seleted_dbnaming.collection)
        var result = await collec.deleteMany({})
    }
    finally
    {
        await client.close();
    }
    if (callback != null){callback()}
}


async function update_mainNotion(dbNamenum, dbTypenum, collectionTypenum, callback)
{
    var dbVarinum = 0
    var seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
    
    const client = new MongoClient(uri);
    
    try
    {
        await client.connect()
        const database = client.db(seleted_dbnaming.DB)
        const collec = database.collection(seleted_dbnaming.collection)
        
        //get date data.
        var getId = await Notion.getIDfromCollecNum(dbNamenum,collectionTypenum)
        var calender = await Notion.getItemNOTION_passorfail(getId)
        async function applyeachid(predoc) 
        {
            var currentdoc = await collec.findOne({"id":predoc["id"]})
            if (currentdoc != null)
            {
                predoc = Object.assign(currentdoc,predoc)
            }
            await collec.replaceOne({"id":predoc["id"]},predoc,{upsert:true})
        }
        for (key in calender)
        {
            predoc = calender[key]
            await applyeachid(predoc)
        }
        //debug
    }
    finally
    {
        await client.close();
    }
    if (callback != null){callback()}
}

async function debug(dbNamenum,dbVarinum, dbTypenum, collectionTypenum, callback)
{
    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
    var docSum = {}
    
    const client = new MongoClient(uri);
    
    try
    {
        await client.connect()
        const database = client.db(seleted_dbnaming.DB)
        const collec = database.collection(seleted_dbnaming.collection)

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
    if (callback != null){callback(docSum)}
    return docSum
}

async function debug_nolog(dbNamenum,dbVarinum, dbTypenum, collectionTypenum, callback)
{
    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,dbVarinum, dbTypenum, collectionTypenum)
    var docSum = {}
    console.log("(mongod_dbmanage_generate) mongodb inner document emited.")
    
    const client = new MongoClient(uri);
    
    try
    {
        await client.connect()
        const database = client.db(seleted_dbnaming.DB)
        const collec = database.collection(seleted_dbnaming.collection)

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
                    
    if (callback != null){callback(docSum)}
    return docSum
}

exports.insertRandomDatepairs = insertRandomDatepairs
exports.initialize = initialize
exports.update_mainNotion = update_mainNotion
exports.debug = debug
exports.copypaste = copypaste
exports.makeNewDB = makeNewDB
exports.deleteSelf = deleteSelf
exports.debug_nolog = debug_nolog