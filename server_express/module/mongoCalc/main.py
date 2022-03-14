from pymongo import MongoClient
from mongod_dbnamefind import getName
import sys
from datetime import date

client = MongoClient(host='localhost', port=27017)

cursor = client.Notionpage_workid.todo.find()

length = 123

resultDB, resultCollection = getName(0,3,0)
resultDB = client[resultDB]
resultCollection = resultDB[resultCollection]

def post_setRateOfProp(propname, rate):
    # make rate resonable. not int -> to int, over range -> boundary set.
    if rate <= 1 :
        rate = 1
    elif rate >= 100:
        rate = 100
    else:
        rate = int(rate)

    # when is today?
    todaystring = date.today().isoformat()

    #make dataset
    today_data = {}

    #check if there is same propname in collection.
    docSet = resultCollection.find({"id":propname},{})
    if docSet == None :
        return -1

    resultCollection.replace_one({"id":propname},{"id":propname, "rate": rate},upsert=True)
    print("python : task fin.")
    sys.stdout.flush()  


