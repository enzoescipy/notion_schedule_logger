const {MongoClient} = require ("mongodb")
const Notion = require('../notion-communicate/index')
const dbnaming = require('./mongod_dbmanage')
const Mongo = require('../mongodb-communicate/server_mongod')
const uri = "mongodb://localhost:27017"

const client = new MongoClient(uri);

const dbnaming = require('./mongod_dbmanage')








async function insertRandomDatepairs(colname, dbname,datestring, callback)
{
    
    if (dbname === dbnaming.maindatabase)
    {
        return -1
    }
    try
    {
        await client.connect()
        const database = client.db(dbname)
        const collec = database.collection(colname)
        
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
        Mongo.debug(colname, dbname, callback)
        await client.close();
    }
    if (callback != null){callback()}
}



exports.insertRandomDatepairs = insertRandomDatepairs
exports.initialize = initialize