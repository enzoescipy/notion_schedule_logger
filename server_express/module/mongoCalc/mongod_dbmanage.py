from pymongo import MongoClient
from pprint import pprint


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
        
