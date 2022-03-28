from pymongo import MongoClient
from pprint import pprint
from datetime import date, timedelta


def getName(dbNamenum,dbVarinum, dbTypenum, collectionTypenum):
    NameDB = "NAMING_system"
    NameDB_collec = "base"
    NameDB_setting = "setting"
    client = MongoClient(host='localhost', port=27017)
    dbNamenum = int(dbNamenum)
    dbVarinum = int(dbVarinum)
    dbTypenum = int(dbTypenum)
    collectionTypenum = int(collectionTypenum)

    # part that decide what document to load
    collec = client[NameDB][NameDB_collec]
    setting_doc = collec.find_one({'id':NameDB_setting})

    typeofDB = setting_doc['typeofDB']
    variofDB = setting_doc['variationofDB']
    typeofCollection = setting_doc['typeofCollection']
    nameofDB = setting_doc['nameofDB']

    dbType = typeofDB[dbTypenum]
    dbVari = variofDB[dbVarinum]
    collectionType = typeofCollection[collectionTypenum]
    dbName = nameofDB[dbNamenum]
    DBstring = dbName + "_" + dbVari + "_" + dbType

    DBnamingDoc = collec.find_one({'id':DBstring})
    client.close()
    if DBnamingDoc != None:
        return DBstring, collectionType
    else:
        return -1

def checkHowContinuous(propname,targetdate,dbNamenum, dbTypenum, collectionTypenum,ignorance=1): # ignorance=2 : one day fault would be acceptable.
    selected_name = getName(dbNamenum,0, dbTypenum, collectionTypenum)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]
    docs = collec.find_one({"id" : propname})
    while True:
        if "_id" in docs:
            del(docs["_id"])
            continue
        if "id" in docs:
            del(docs["id"])
            continue
        break
    docs = list(docs.items())

    def sortfunc(doc):
        doc_date = doc[0]
        return date.fromisoformat(doc_date)
    docs.sort(reverse=True,key=sortfunc)
    
    count = 0
    ignore = 0
    for i in range(len(docs)):
        isdone = docs[i][1]
        isdate = docs[i][0]
        if date.fromisoformat(isdate) > date.fromisoformat(targetdate):
            continue
        if isdone == False:
            ignore += 1
            if ignore >= ignorance:
                client.close()
                return count
        elif isdone == True:
            ignore = 0
            count += 1
        else:
            client.close()
            raise Exception("wrong type exception!")
    client.close()
    return count

