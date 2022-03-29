const {MongoClient} = require ("mongodb")
const dbnaming = require('../mongodb-communicate/mongod_dbmanage_Name')
const settings = require('../mongodb-communicate/mongod_dbmanage_SETTINGs')
const uri = "mongodb://localhost:27017"



async function calc_pointer_organize(dbNamenum, dbTypenum, collectionTypenum,callback)
{
    const client = new MongoClient(uri);

    //take settings for data amount
    current_length = await settings.get(0,0,0,dbTypenum,0,)

    // main organization
    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,1, dbTypenum, collectionTypenum)
    await client.connect()
    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    async function pointer_finder(collec)
    {
        onlyfor_pointer = await collec.find({"sub-collec" : "pointer"})
        var organized_calender = await doc_spliter(onlyfor_pointer)

        // delete date older then current_length

        organized_calender = await elder_deleter(organized_calender, current_length)
        
        return organized_calender
    }

    async function elder_deleter(calender, deletelength)
    {
        calender_arr = Object.entries(calender)
        calender_arr.sort((a,b) => {
            var a_date = Date.parse(a[0])
            var b_date = Date.parse(b[0])
            if (a_date < b_date) {return -1}
            else if (a_date > b_date) {return 1}
            else {return 0}
          })
        calender_arr = calender_arr.slice(calender_arr.length - deletelength,calender_arr.length)
        calender = Object.fromEntries(calender_arr)
        return calender
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
            if (key == "sub-collec" || key == "id" || key == "_id")
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
    client.close()
    if (callback != null){callback(organized_calender); return }
    return organized_calender
}

async function calc_commulative_maker(dbNamenum, dbTypenum, collectionTypenum, callback)
{

    const client = new MongoClient(uri);

    //take settings for data amount
    current_length = await settings.get(0,0,0,dbTypenum,0,)

    // main organization
    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,1, dbTypenum, collectionTypenum)
    await client.connect()
    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    async function pointer_finder(collec)
    {
        onlyfor_pointer = await collec.find({"sub-collec" : "pointer_commulative"})
        var organized_calender = await doc_spliter(onlyfor_pointer)

        // delete date older then current_length

        organized_calender = await elder_deleter(organized_calender, current_length)
        
        return organized_calender
    }

    async function elder_deleter(calender, deletelength)
    {
        calender_arr = Object.entries(calender)
        calender_arr.sort((a,b) => {
            var a_date = Date.parse(a[0])
            var b_date = Date.parse(b[0])
            if (a_date < b_date) {return -1}
            else if (a_date > b_date) {return 1}
            else {return 0}
          })
        calender_arr = calender_arr.slice(calender_arr.length - deletelength,calender_arr.length)
        calender = Object.fromEntries(calender_arr)
        return calender
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
            if (key == "sub-collec" || key == "id" || key == "_id")
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
    client.close()
    if (callback != null){callback(organized_calender); return }
    return organized_calender
}

async function calc_pointer_reOrganize(dbNamenum, dbTypenum, collectionTypenum, callback)
{

    const client = new MongoClient(uri);

    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,1, dbTypenum, collectionTypenum)
    await client.connect()
    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    var calender = await calc_pointer_organize(dbNamenum, dbTypenum, collectionTypenum)
    var calender_legacy = await collec.find({'sub-collec': 'pointer'}, {"id":1})

    // color index
    async function color_indexer(calender_legacy)
    {   
        var colorized = {}
        await calender_legacy.forEach((doc) => {
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
    var result = await color_indexer(calender_legacy)
    var commu = await calc_commulative_maker(dbNamenum, dbTypenum, collectionTypenum, callback)

    var organized = {"index": result, "data" : calender,"commulative":commu}
    client.close()
    if (callback != null){callback(organized)}

    return organized
}

async function calc_indexOnly(dbNamenum, dbTypenum, collectionTypenum, callback)
{

    const client = new MongoClient(uri);

    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,1, dbTypenum, collectionTypenum)
    await client.connect()
    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    var calender_legacy = await collec.find({'sub-collec': 'pointer'}, {"id":1})
    var index = await color_indexer(calender_legacy)
    client.close()
    if (callback != null){callback(index)}
    return index
}

async function calc_rate_organize(dbNamenum, dbTypenum, collectionTypenum,callback)
{

    const client = new MongoClient(uri);

    seleted_dbnaming = await dbnaming.getDBnaming(dbNamenum,1, dbTypenum, collectionTypenum)
    await client.connect()
    const database = client.db(seleted_dbnaming.DB)
    const collec = database.collection(seleted_dbnaming.collection)

    async function rateData_organizer(collec)
    {
        // get rate DB and re-organize
        var rate_DB = await collec.find({"sub-collec" : "rater"}) 
        var colorizer_child = colorizer()
        var rateData_organized = {}
        await rate_DB.forEach((doc) => {
            var earlist_date = earlist_date_finder(doc)
            var propname = doc["id"]
            var rate = doc[earlist_date]["rate_abs"]
            var ignorance = doc[earlist_date]["ignorance"]
            var color = colorizer_child()

            rateData_organized[propname] = {"E_date":earlist_date, "rate":rate, "color":color, "ignorance":ignorance}
        })
        return rateData_organized
    }

    function earlist_date_finder(doc)
    {
        var date_store = undefined
        for (key in doc)
        {

            if (key == "sub-collec" || key == "id" | key == "_id")
            {
                continue
            } 
            if ((date_store === undefined) || (Date.parse(date_store) < Date.parse(key)))
            {
                date_store = key
            }
        }
        return date_store
    }

    function colorizer()
    {
        var colortable = ["maroon", "red","purple","fuchsia","green","lime","olive","yellow","navy","blue","teal","aqua"]
        var count = -1
        function color_counter()
        {
            count += 1
            return colortable[count]
        }
        return color_counter
    }
    

    var rateData_organized = await rateData_organizer(collec)
    client.close()
    if (callback != null){callback(rateData_organized)}
    return rateData_organized
}

exports.calc_pointer_organize = calc_pointer_organize
exports.calc_pointer_reOrganize = calc_pointer_reOrganize
exports.calc_rate_organize = calc_rate_organize
exports.calc_indexOnly = calc_indexOnly