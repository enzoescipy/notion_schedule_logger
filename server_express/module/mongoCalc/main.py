from pymongo import MongoClient
import sys

client = MongoClient(host='localhost', port=27017)

cursor = client.Notionpage_workid.todo.find()

funclist = []

def test():
    print(len(cursor))
    sys.stdout.flush()
funclist.append(test)

mode = sys.argv[1]

funclist[mode]()