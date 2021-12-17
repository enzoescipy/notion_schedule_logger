var Client = require('mongodb').MongoClient
var Notion = require('./index.js')

Client.connect('mongodb://localhost:27017/testDB', function(error, client){
    if(error) {
        console.log(error);
    } else {
        var calender = Notion.getItemNOTION(Notion.hobbyId)
        var testDB = client.db("testDB")
        for (key in calender)
        {
            // get date data .
            var data = calender[key]
            var date_id = date.id
            delete data[id]
            // check if there are already data exist in DB.
            var query = {id : date_id}
            var cursor = testDB.find(query)
            cursor.each(function(err, doc){
                if(err){
                    console.log(err)
                }else{
                    if (doc == null)
                    {
                        //there are no current date it!
                        testDB.insert(data)
                    }
                    else
                    {
                        //there are already curent date id.
                        for (date in data)
                        {
                            testDB.update( {id : date_id}, {$set: { date : data[date] }})
                        }
                    }
                }
            })
            
        }

        var dbAll = testDB.find()
        dbAll.each(function(err, doc){
            if(err){
                console.log(err)
            }else{
                console.log(doc)
            }
        })
            
    }
});
