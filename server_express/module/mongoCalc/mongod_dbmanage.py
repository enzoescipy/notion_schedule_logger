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
    print(docs)
    def sortfunc(doc):
        doc_date = doc["id"]
        return date.fromisoformat(doc_date)
    while 
    docs.sort(key=sortfunc)
    if docs == None:
        client.close()
        return 0
    else:
        count = 0
        ignore = 0
        while True:
            isdone = "invalid"
            try:
                isdone = docs[targetdate]
            except KeyError:
                client.close()
                return count
                
            if isdone == False:
                ignore += 1
                if ignore >= ignorance:
                    client.close()
                    return count
            elif isdone == True:
                ignore = 0
                count += 1
                targetdate = date.fromisoformat(targetdate)
                targetdate += timedelta(days=1)
                targetdate = date.isoformat(targetdate)
            else:
                client.close()
                raise Exception("wrong type exception!")
            

