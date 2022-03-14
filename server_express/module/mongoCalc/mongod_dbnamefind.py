from pymongo import MongoClient


client = MongoClient(host='localhost', port=27017)

NameDB = "NAMING_system"
NameDB_collec = "base"
NameDB_setting = "setting"

def getName(dbNamenum,dbVarinum, dbTypenum, collectionTypenum):
    dbNamenum = int(dbNamenum)
    dbVarinum = int(dbVarinum)
    dbTypenum = int(dbTypenum)
    collectionTypenum = int(collectionTypenum)

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
    if DBnamingDoc == None:
        print(DBnamingDoc)
        return DBstring, collectionType
    else:
        return -1
        
