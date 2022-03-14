from pymongo import MongoClient
from mongod_dbnamefind import getName
import sys
from datetime import date

client = MongoClient(host='localhost', port=27017)

def post_setRateOfProp(propname, rate, isTest):
    if isTest == True:
        isTest = 0
    elif isTest == False:
        isTest = 1
    else:
        isTest = "invalid"
    selected_name = getName(0,1,isTest,0)
    print(selected_name)
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

