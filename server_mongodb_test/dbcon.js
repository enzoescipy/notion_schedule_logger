var Client = require('mongodb').MongoClient
var Notion = require('index')

Client.connect('mongodb://localhost:27017/testDB', function(error, db){
    if(error) {
        console.log(error);
    } else {
        var calender = Notion.getItemNOTION(hobbyId)
        for (key in calender)
        {
            // get date data .
            var data = calender[key]
            var date_id = date.id
            delete data[id]
            // check if there are already data exist in DB.
            var query = {id : date_id}
            var testDB = collection("testDB")
            var cursor = db.testDB.find(query)
            cursor.each(function(err, doc){
                if(err){
                    console.log(err)
                }else{
                    if (doc == null)
                    {
                        //there are no current date it!
                        db.testDB.insert(data)
                    }
                    else
                    {
                        //there are already curent date id.
                        for (date in data)
                        {
                            db.testDB.update( {id : date_id}, {$set: { date : data[date] }})
                        }
                    }
                }
            })
            
        }

        db.testDB.find().each(function(err, doc){
            if(err){
                console.log(err)
            }else{
                console.log(doc)
            }
        })
        
    }
});