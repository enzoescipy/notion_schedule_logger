from pymongo import MongoClient
import sys

client = MongoClient(host='localhost', port=27017)

cursor = client.Notionpage_workid.todo.find()

funclist = []

print("hello, wodld! by python.")
sys.stdout.flush()