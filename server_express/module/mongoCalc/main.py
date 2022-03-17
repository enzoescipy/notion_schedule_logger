from pymongo import MongoClient
from mongod_dbmanage import getName, debug
import sys
from datetime import date

#decide what function to excute

fget = sys.argv[1]
fvar = sys.argv.copy()
fvar.pop(0)
fvar.pop(0)


def post_setRateOfProp(propname, rate, isTest):
    client = MongoClient(host='localhost', port=27017)
    propname = str(propname)
    rate = int(rate)
    isTest = int(isTest)
    # get name and collectionName
    if type(propname) != type(" "):
        return -1
    if (isTest == 0 or isTest == 1):
        isTest = "invalid"
    else:
        if isTest == 1:
            isTest = 0
        else:
            isTest = 1
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
        rate_sum += doc[todaystring]["rate_abs"]

    for doc_2 in  docs:
        doc_2[todaystring]["rate_rel"] = doc_2[todaystring]["rate_abs"] / rate_sum
        doc_2_id = doc_2["id"]
        collec.replace_one({"id" : doc_2_id}, doc_2)
    

    client.close()

if fget == "0":
    #post_setRateOfProp(*fvar)
    print("hellohelloohdlle")
    sys.stdout.flush()
else:
    print("invalid input.")
    sys.stdout.flush()
