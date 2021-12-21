const MongoClient = require ("mongodb")
const Notion = require('./index.js')

const uri = "mongodb://localhost:27017"

const client = new MongoClient(uri);

async function update()
{
    try
    {
        await client.connect()
        const database = client.db("Notionpage_hobbyid")
        const todo = database.collection("todo")
        
        //get date data.
        var calender = Notion.getItemNOTION(Notion.hobbyId)
        for (key in calender)
        {
            //get date data.
            var date_data_now = calender[key] //(days in weeks) : (did or not boolean) obj.
            date_id = date_data_now.id // what i did. ex) study math
            delete date_data_now[id]

            //check if there are already data that has same date_id exist in DB.
            var query = {id : date_id}
            var cursor = await todo.find(query) //document cursor. contains 'many'{ id : date_id, date1:true/false,  date2:true/false, ...}

            async function iter_dbrewrite(doc)
            {
                try
                {
                    if (doc != null) 
                    {
                        var date_data_db = doc // the {date1 : true, date2 : false, ...}
                        var id_db = doc.id
                        delete date_data_db[id]
                        //compare the _now date and db's date.
                        for (date_now in date_data_now)
                        {
                            //date_now is like 2021-12-21
                            var did_now = date_data_now[date_now] // is true or false.
                            
                            //check if there is same day in db.
                            var dates_db = date_data_db.keys()
                            var foundequal = dates_db.find(db => db === date_now)
                            var update_doc
                            var filter
                            if ( foundequal === undefined )
                            {
                                //if there is no same date in the db then add it.
                                update_doc = {date_now:did_now}
                                filter = {id:id_db} //update 
                            }
                            else
                            {
                                //if there is same date in the db then update it.
                                update_doc = {$set: { date_now:did_now }}
                                filter = {id:id_db} //update 
                                //and delete in the db copy.
                                delete date_data_db[foundequal]
                            }
                            var result = await todo.updateOne(filter, update_doc, {}) //it can be done as asynchronously BUT for now, synchronous action.
                            console.log("${result.matchedCount} was matched the filter, ${result.modifiedCount} was modified.")
                        }
                    }
                    else
                    {
                        //if there is no date_id(study) in the database, create a new document.
                        date_data_now[id] = date_id
                        await todo.insertOne(date_data_now)
                    }
                }
                finally
                {
                    await client.close()
                }
            }
            
            while (true)
            {
                var doc = await cursor.next()
                if (doc === null) {break}

                await iter_dbrewrite(doc)   
            }
        }
    }
    finally
    {
        await client.close();
    }
}

async function debug()
{
    try
    {
        await client.connect()
        const database = client.db("Notionpage_hobbyid")
        const todo = database.collection("todo")

        const result = await todo.find()
        console.log(result)
    }
    finally
    {
        await client.close()
    }
}

async function main()
{
    await update()
    await debug()
}

main()
