from pymongo import MongoClient
import sys

client = MongoClient(host='localhost', port=27017)

cursor = client.Notionpage_workid.todo.find()

length = len(cursor)

resultDB = client["PythonCalculation"]
resultCollection = resultDB["test"]

resultCollection.delete_many({})

resultCollection.insert_one({"value" : length})