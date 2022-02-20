const {MongoClient} = require ("mongodb")
const Notion = require('../notion-communicate/index')
const dbnaming = require('./mongod_dbmanage_Name')
const uri = "mongodb://localhost:27017"

const client = new MongoClient(uri);

async function makeNewDB(dbNamenum, dbTypenum, collectionTypenum, callback)
{
    await dbnaming.putDBnaming(dbNamenum, dbTypenum, collectionTypenum)
    await initialize(dbNamenum, dbTypenum, collectionTypenum)
    if (callback != null){callback()}
}

async function insertRandomDatepairs(dbNamenum, dbTypenum, collectionTypenum,datestring, callback)
{

    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum, dbTypenum, collectionTypenum)
    
    try
    {
        await client.connect()
        const database = client.db(seleted_dbnaming.DB)
        const collec = database.collection(seleted_dbnaming.collection)
        
        //get date data.
        var calender = await Notion.testsetget(Notion.workId,datestring)
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
        debug(dbNamenum, dbTypenum, collectionTypenum)
        await client.close();
    }
    if (callback != null){callback()}
}

async function copypaste(dbNamenum1, dbTypenum1, collectionTypenum1,dbNamenum2, dbTypenum2, collectionTypenum2, callback)     
{
    seleted_dbnaming1 = await dbnaming.getDBnaming(dbNamenum1, dbTypenum1, collectionTypenum1)
    seleted_dbnaming2 = await dbnaming.getDBnaming(dbNamenum2, dbTypenum2, collectionTypenum2)
    try
    {
        // basic connection
        await client.connect()
        const database1 = client.db(seleted_dbnaming1.DB)
        const collec1 = database1.collection(seleted_dbnaming1.collection)



        //get the copied DB doc.
        var original_db_all = collec1.find()

        //remove all of document in pasting DB.    
        await client.close()
        await client.connect()     
        var result = await collec2.deleteMany({})
        console.log("\ndeleted" + result.deletedCount + " data first.\n")

        //write document to pasting DB
        const database2 = client.db(seleted_dbnaming2.DB)
        const collec2 = database2.collection(seleted_dbnaming2.collection)
        await original_db_all.forEach(function(doc){
            if (doc != null)
            {
                collec2.insertOne(doc)
            }
        })


    }
    finally
    {
        await client.close();
    }
    if (callback != null){callback()}
}

async function initialize(dbNamenum, dbTypenum, collectionTypenum, callback)
{
    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum, dbTypenum, collectionTypenum)
    try
    {
        await client.connect()
        const database = client.db(seleted_dbnaming.DB)
        const collec = database.collection(seleted_dbnaming.collection)
        var result = await collec.deleteMany({})
        console.log("\ndeleted" + result.deletedCount + " data first.\n")
    }
    finally
    {
        await client.close();
    }
    if (callback != null){callback()}
}


async function update(dbNamenum, dbTypenum, collectionTypenum, callback)
{
    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum, dbTypenum, collectionTypenum)
    try
    {
        await client.connect()
        const database = client.db(seleted_dbnaming.DB)
        const collec = database.collection(seleted_dbnaming.collection)
        
        //get date data.
        var calender = await Notion.getItemNOTION(Notion.workId)
        console.log("calender debug:")
        console.log(calender)
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
                            var result = await collec.updateOne(filter, update_doc, {}) //it can be done as asynchronously BUT for now, synchronous action.
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
        await client.close();
    }
    if (callback != null){callback()}
}

async function debug(dbNamenum, dbTypenum, collectionTypenum, callback)
{
    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum, dbTypenum, collectionTypenum)
    var docSum = {}
    console.log("(mongod_dbmanage_generate) mongodb inner document emited.")
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

exports.insertRandomDatepairs = insertRandomDatepairs
exports.initialize = initialize
exports.update = update
exports.debug = debug
exports.copypaste = copypaste
exports.makeNewDB = makeNewDB