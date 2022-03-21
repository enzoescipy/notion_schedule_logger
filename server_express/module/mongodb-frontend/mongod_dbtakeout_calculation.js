const {MongoClient} = require ("mongodb")
const Notion = require('../notion-communicate/index')
const dbnaming = require('./mongod_dbmanage_Name')
const uri = "mongodb://localhost:27017"

const client = new MongoClient(uri);


async function calc_pointer_organize(dbNamenum, dbTypenum, collectionTypenum,callback)
{
    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,1, dbTypenum, collectionTypenum)
    await client.connect()
    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    async function pointer_finder(collec)
    {
        onlyfor_pointer = await collec.find({"sub-collec" : "pointer"})
        var organized_calender = doc_spliter(onlyfor_pointer)
        return organized_calender
    }

    function doc_spliter(onlyfor_pointer)
    {   
        onlyfor_pointer.forEach(doc_seleter)
        var organized_calender = onlyfor_pointer
        return organized_calender
    }

    function doc_seleter(doc)
    {
        var organized_calender={}
        var propname = doc["id"] 
        for (key in doc)
        {
            var value = doc[key]
            if (key == "sub-collec" || key == "id" | key == "_id")
            {
                data_saver(-1,organized_calender)
            }
            else
            {
                data_saver([propname, key, value],organized_calender)
            }

        }
        return organized_calender
    }

    function data_saver(data, calender)
    {
        if (data == -1){return}
        function replacer(finderkey,insertkey,value)
        {
            try
            {
                isreplaceable = calender[finderkey]
            }
            catch
            {
                calender[finderkey] = {}
            }
            try
            {
                isreplaceable = calender[finderkey][insertkey]
            }
            catch
            {
                calender[finderkey][insertkey] = value
            }
        }

        replacer(data[1],data[0],data[2])
    }
    var organized_calender = await pointer_finder(collec)
    console.log(organized_calender)
    return organized_calender
}

exports.calc_pointer_organize = calc_pointer_organize