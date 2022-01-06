from pymongo import MongoClient

client = MongoClient(host='localhost', port=27017)

print(client.Notionpage_workid.todo)