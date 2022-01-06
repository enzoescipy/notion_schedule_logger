from pymongo import MongoClient

client = MongoClient(host='localhost', port=27017)

cursor = client.Notionpage_workid.todo.find()

for doc in cursor:
    print(doc)