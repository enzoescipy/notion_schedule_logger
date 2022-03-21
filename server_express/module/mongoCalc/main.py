from pymongo import MongoClient
from mongod_dbmanage import getName, checkHowContinuous
import sys
from datetime import date

#decide what function to excute

fget = sys.argv[1]
fvar = sys.argv.copy()
fvar.pop(0)
fvar.pop(0)

class Mathfunc:
    
    @staticmethod
    def smallDip_increase_maintain(starting=0.5, upperbound = 1):
        original_func = [(0,1.36),(1,0.58),(2,0.16),(3,2.06),(4,3.79),(5,4.11),(6,5.00)] #calculated by function_reward.ggb geogebra5
        parallel_mover = 0
        multiplier = 1
        multiplier = (starting - upperbound) /( original_func[6][1] - original_func[0][1])
        parallel_mover = starting - original_func[0][1] * multiplier
        adjusted_function = []
        for point in original_func:
            adjusted_function.append((point[0], point[1]*multiplier + parallel_mover))
        return adjusted_function

def normal_rewardfunc(num):
    base = Mathfunc.smallDip_increase_maintain()
    if 0 <= num <= 6:
        return base[num][1]
    elif num > 6:
        return base[6][1]
    else:
        return -1
Mathfunc.normal_rewardfunc = normal_rewardfunc






def post_setRateOfProp(propname, rate, fromTest,ignorance, propdate):
    propname = str(propname)
    rate = int(rate)
    fromTest = int(fromTest)
    # get name and collectionName
    if fromTest == 1:
        fromTest = 0
    else:
        fromTest = 1

    selected_name = getName(0,1,fromTest,0)

    client = MongoClient(host='localhost', port=27017)
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
    todaystring = "invalid"
    if propdate == "XXXX-XX-XX":
        todaystring = date.today().isoformat()
    elif propdate[4] == "-" and propdate[7] == "-":
        todaystring = propdate
    else:
        client.close()
        print("inappriate date property.")
        sys.stdout.flush()
        return -1


    # find dataset.

    docs = collec.find_one({"id" : propname})

    if docs == None:
        docs = {todaystring : {"ignorance":ignorance, "rate_abs" : rate, "rate_rel" : "invalid"}, "id" : propname}
        collec.insert_one(docs)
    else:
        if todaystring in docs:
            docs[todaystring]["rate_abs"] = rate
        else:
            docs[todaystring] = {"ignorance":ignorance,"rate_abs" : rate, "rate_rel" : "invalid"}
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
    
    debug  = list(collec.find({}))
    client.close()
    print(debug)
    sys.stdout.flush()
    return 1

def calc_getPointOfProp(propname, propdate, fromTest):
    propname = str(propname)
    propdate = str(propdate)
    fromTest = int(fromTest)
    if fromTest == 1:
        fromTest = 0
    else:
        fromTest = 1


    selected_name = getName(0,1,fromTest,0)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    while True:
        # find docs that has same id property.
        docs = collec.find_one({"id" : propname})
        if docs == None:
            client.close()
            print(-1,"no match propname")
            sys.stdout.flush()
            return -1, "no match propname"
        else:
            # find if there are any date match with our purpose.
            datetime_list = []
            for day in docs.keys():
                current_datetime = "invalid"
                try:
                    if day[4] == "-" and day[7] == "-":
                        current_datetime = date.fromisoformat(day)
                        datetime_list.append(current_datetime)
                        print(len(datetime_list))
                except Exception as exp:
                    continue

            if len(datetime_list) == 0:
                # if there are no date : rate pairs, make it. rate_abs = 25 automatically.
                post_setRateOfProp(propname, 25, fromTest, propdate=propdate)
            else:
                break


        target_date = datetime_list[0]
        propdate_todateformat = date.fromisoformat(propdate)
        for day in datetime_list:
            if day <= propdate_todateformat and target_date <= day:
                target_date = day
    target_date_str = target_date.isoformat()
    target_rate = docs[target_date_str]["rate_rel"]
    target_ignorance = docs[target_date_str]["ignorance"]
    if target_rate == "invalid":
        client.close()
        print(-1,"rate_rel not calculated")
        sys.stdout.flush()
        return -1, "rate_rel not calculated"
    else:
        #take the... "how long do you continuously keep your todo."
        client.close()
        continuous_num = checkHowContinuous(propname, propdate, 0,fromTest,0,ignorance=target_ignorance)
        final_point = Mathfunc.normal_rewardfunc(continuous_num) * target_rate
        if final_point >= 0 :
            client.close()
            print(final_point)
            sys.stdout.flush()
            return 1

    print(-1, "function ended")
    sys.stdout.flush()
    return 1

if fget == "0":
    post_setRateOfProp(*fvar)
elif fget == "1":
    calc_getPointOfProp(*fvar)
else:
    print("invalid input.")
    sys.stdout.flush()