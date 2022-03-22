const {MongoClient} = require ("mongodb")
const Notion = require('../notion-communicate/index')
const dbnaming = require('../mongodb-communicate/mongod_dbmanage_Name')
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
        var organized_calender = await doc_spliter(onlyfor_pointer)
        return organized_calender
    }

    async function doc_spliter(onlyfor_pointer)
    {   
        var organized_calender = {}
        await onlyfor_pointer.forEach((doc) => {
            organized_calender = doc_seleter(doc,organized_calender)
        })
        
        return organized_calender
    }

    function doc_seleter(doc, organized_calender)
    {
        var propname = doc["id"] 
        for (key in doc)
        {
            var value = doc[key]
            if (key == "sub-collec" || key == "id" | key == "_id")
            {
                organized_calender = data_saver(-1,organized_calender)
            }
            else
            {
                organized_calender = data_saver([propname, key, value],organized_calender)
            }

        }
        return organized_calender
    }

    function data_saver(data, calender)
    {
        if (data == -1){return calender}
        function replacer(finderkey,insertkey,value)
        {
            if (calender[finderkey] === undefined)
            {
                calender[finderkey] = {}
            }

            if (calender[finderkey][insertkey] === undefined)
            {
                calender[finderkey][insertkey] = value
            }
        }

        replacer(data[1],data[0],data[2])
        return calender
    }
    var organized_calender = await pointer_finder(collec)
    if (callback != null){callback(organized_calender); return }
    return organized_calender
}

async function calc_pointer_reOrganize(dbNamenum, dbTypenum, collectionTypenum, callback)
{
    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,1, dbTypenum, collectionTypenum)
    await client.connect()
    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    var calender = await calc_pointer_organize(dbNamenum, dbTypenum, collectionTypenum)
    var calender_legacy = await collec.find({'sub-collec': 'pointer'}, {"id":1})

    // color index
    function color_indexer(calender_legacy)
    {   
        var colorized = {}
        calender_legacy.forEach((doc) => {
            colorized = colorputter(doc, colorized)
        })
        return colorized
    }
    function colorputter(doc, colorized)
    {
        var id = doc["id"]
        var color = colorsampler(colorized, id)
        colorized[id] = color
        return colorized
    }
    function colorsampler(colorized)
    {
        var sample = ["maroon", "red","purple","fuchsia","green","lime","olive","yellow","navy","blue","teal","aqua"]
        for (j in sample)
        {
            var suggested = sample[j]
            for (i in colorized)
            {
                var color = colorized[i]
                if (color === suggested)
                {
                    suggested = -1
                }
            }
            if (suggested !== -1)
            {
                return suggested
            }
        }
        return "no color left error"
    }

    if (callback != null){callback({"index": color_indexer(calender_legacy), "data" : calender})}

    return {"index": color_indexer(calender_legacy), "data" : calender}
}

exports.calc_pointer_organize = calc_pointer_organize
exports.calc_pointer_reOrganize = calc_pointer_reOrganize