from pymongo import MongoClient
from mongod_dbmanage import getName, debug
import sys
from datetime import date

client = MongoClient(host='localhost', port=27017)

def post_setRateOfProp(propname, rate, isTest):
    # get name and collectionName
    if type(propname) != type(" "):
        return -1
    if isTest == True:
        isTest = 0
    elif isTest == False:
        isTest = 1
    else:
        isTest = "invalid"
    selected_name = getName(0,1,isTest,0)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]
    # make rate resonable. not int -> to int, over range -> boundary set.
    if rate <= 1 :
        rate = 1
    elif rate >= 100:
        rate = 100
    else:
        rate = int(rate)

    # when is today?
    todaystring = date.today().isoformat()

    # find dataset.
    docs = collec.find_one({"id" : propname})

    if docs == None:
        docs = {todaystring : {"rate_abs" : rate, "rate_rel" : "invalid"}, "id" : propname}
        collec.insert_one(docs)
    else:
        if todaystring in docs:
            docs[todaystring]["rate_abs"] = rate
        else:
            docs[todaystring] = {"rate_abs" : rate, "rate_rel" : "invalid"}
        collec.replace_one({"id" : propname}, docs)
    
    # put and calculate the rate_rel
    docs = collec.find({todaystring:{'$exists': 1}})
    docs = list(docs)
    rate_sum = 0
    for doc in  docs: 
        print("star")
        rate_sum += doc[todaystring]["rate_abs"]

    print(rate_sum, len(docs))
    for doc in  docs:
        print("star")
        doc[todaystring]["rate_rel"] = doc[todaystring]["rate_abs"] / rate_sum
        doc_id = doc["id"]
        collec.replace_one({"id" : doc_id}, doc)

    #debug
    debug(0,1,isTest,0)

    client.close()

post_setRateOfProp("hoho",10,True)