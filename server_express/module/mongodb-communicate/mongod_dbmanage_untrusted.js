const mongoGenerate = require('./mongod_dbmanage_generate')
const mongoNameManage = require('./mongod_dbmanage_Name')

async function get_prop_isDid(propname, date, dbNamenum,dbTypenum,collectionTypenum, callback)
{
    var mongoget = await mongoGenerate.debug_nolog(dbNamenum,0, dbTypenum, collectionTypenum)
    var docnum = -1
    for (let i in mongoget)
    {
        var doc = mongoget[i]
        try
        {
            if (doc["id"] == propname)
            {
                docnum = i
                break
            }
        }
        catch
        {
            continue
        }
    }
    if (docnum == -1)
    {
        return -1
    }

    var doc = mongoget[docnum]
    for (docdate in doc)
    {
        if (docdate == date)
        {
            if (callback != null)
            {
                callback(docSum)
            }
            return doc[date]
        }
    }

}



async function get_prop_rate(propname, date, dbNamenum,dbTypenum,collectionTypenum, callback)
{
    var mongoget = await mongoGenerate.debug_nolog(dbNamenum,1, dbTypenum, collectionTypenum)
    var docnum = -1
    for (let i in mongoget)
    {
        var doc = mongoget[i]
        try
        {
            if (doc["id"] == propname)
            {
                docnum = i
                break
            }
        }
        catch
        {
            continue
        }
    }
    if (docnum == -1)
    {
        return -1
    }

    var doc = mongoget[docnum]
    for (docdate in doc)
    {
        if (docdate == date)
        {
            if (callback != null)
            {
                callback(docSum)
            }
            return doc[date]
        }
    }
}


exports.get_prop_isDid = get_prop_isDid
exports.get_prop_rate = get_prop_rate