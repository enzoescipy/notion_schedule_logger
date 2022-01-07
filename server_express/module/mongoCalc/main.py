from pymongo import MongoClient
import sys

client = MongoClient(host='localhost', port=27017)

cursor = client.Notionpage_workid.todo.find()

length = 123

resultDB = client["PythonCalculation"]
resultCollection = resultDB["test"]


resultCollection.delete_many({})

resultCollection.insert_one({"value" : length})


print("python : task fin.")
sys.stdout.flush()