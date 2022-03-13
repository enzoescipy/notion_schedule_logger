from pymongo import MongoClient
from mongod_dbnamefind import getName
import sys

client = MongoClient(host='localhost', port=27017)

cursor = client.Notionpage_workid.todo.find()

length = 123

resultDB, resultCollection = getName(0,3,0)
resultDB = client[resultDB]
resultCollection = resultDB[resultCollection]

def post_setRateOfProp(propname, rate):
    #check if there is same propname in collection.
    docSet = resultCollection.find({"id":propname},{})
    if docSet == None :
        return -1

    resultCollection.replace_one({"id":propname},{"id":propname, "rate": rate},upsert=True)


print("python : task fin.")
sys.stdout.flush()