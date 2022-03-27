from pymongo import MongoClient
from mongod_dbmanage import getName, checkHowContinuous
import sys
from datetime import date, timedelta

#decide what function to excute

fget = sys.argv[1]
fvar = sys.argv.copy()
fvar.pop(0)
fvar.pop(0)
class Mathfunc:
    
    @staticmethod
    def smallDip_increase_maintain(starting=0.5, upperbound = 1):
        original_func = [(0,1.28),(1,1.52),(2,0.82),(3,1.3),(4,3.88),(5,5.46),(6,6)] #calculated by function_reward.ggb geogebra5
        parallel_mover = 0
        multiplier = 1
        multiplier = (starting - upperbound) /( original_func[0][1] - original_func[6][1])
        parallel_mover = starting - original_func[0][1] * multiplier
        adjusted_function = []
        for point in original_func:
            adjusted_function.append((point[0], point[1]*multiplier + parallel_mover))
        return adjusted_function
    def maintain_drop_maintain(starting=0.25, end=0):
        original_func = [(0,0.25),(1,0.25),(2,0.24),(3,0.22),(4,0.17),(5,0.1),(6,0)]
        parallel_mover = 0
        multiplier = 1
        multiplier = (starting - end) /( original_func[0][1] - original_func[6][1])
        parallel_mover = starting - original_func[0][1] * multiplier
        adjusted_function = []
        for point in original_func:
            adjusted_function.append((point[0], point[1]*multiplier + parallel_mover))
        return adjusted_function

def normal_rewardfunc(num):
    num = num - 1
    base = Mathfunc.smallDip_increase_maintain()
    if 0 <= num <= 6:
        return base[num][1]
    elif num > 6:
        return base[6][1]
    elif num == -1:
        return 0.0
    else:
        return -1
def normal_rateRelCalc_limitPropAmount(num, rate_abs, start_fixrate=0.1):
    num = int((num-1)*0.5)
    base = Mathfunc.maintain_drop_maintain(starting=rate_abs*start_fixrate)
    if 0 <= num <= 6:
        return base[num][1]
    elif num > 6:
        return base[6][1]
    elif num == -1:
        return 0.0
    else:
        return -1
Mathfunc.normal_rewardfunc = normal_rewardfunc
Mathfunc.normal_rateRelCalc_limitPropAmount = normal_rateRelCalc_limitPropAmount






def post_setRateOfProp_depracated(propname, rate, fromTest,ignorance, propdate, insertonly=False):
    propname = str(propname)
    rate = int(rate)
    fromTest = int(fromTest)
    ignorance = int(ignorance)
    # get name and collectionName

    selected_name = getName(0,1,fromTest,0)

    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    selected_notionName = getName(0,0,fromTest, 0)
    selected_col = selected_notionName[1]
    selected_name = selected_notionName[0]
    collec_notion = client[selected_name][selected_col]
    # search for if propname exist in the notion DB. if not, reject.
    propname_test = collec_notion.find({"id":propname})
    if len(list(propname_test)) == 0:
        client.close()
        print("no propname found in server. refresh it first. propname : ",propname)
        sys.stdout.flush()
        return -1
    

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
            if insertonly == True:
                return -1
            docs[todaystring]["rate_abs"] = rate
            docs[todaystring]["ignorance"] = ignorance
        else:
            docs[todaystring] = {"ignorance":ignorance,"rate_abs" : rate, "rate_rel" : "invalid"}
        collec.replace_one({"id" : propname}, docs)

    # put and calculate the rate_rel
    docs = collec.find({todaystring:{'$exists': 1}})
    docs = list(docs)
    rate_sum = 0
    prop_amount = 0
    for doc in  docs: 
        prop_amount += 1
        rate_sum += doc[todaystring]["rate_abs"]

    for doc_2 in  docs:
        doc_2[todaystring]["rate_rel"] = Mathfunc.normal_rateRelCalc_limitPropAmount(prop_amount,doc_2[todaystring]["rate_abs"])
        doc_2_id = doc_2["id"]
        collec.replace_one({"id" : doc_2_id}, doc_2)
    
    debug  = list(collec.find({}))
    client.close()
    sys.stdout.flush()
    return 1

def post_setRateOfProp_noflush(propname, rate, fromTest,ignorance, propdate):
    propname = str(propname)
    rate = int(rate)
    fromTest = int(fromTest)
    ignorance = int(ignorance)
    # get name and collectionName

    selected_name = getName(0,1,fromTest,0)

    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    selected_notionName = getName(0,0,fromTest, 0)
    selected_col = selected_notionName[1]
    selected_name = selected_notionName[0]
    collec_notion = client[selected_name][selected_col]
    # search for if propname exist in the notion DB. if not, reject.
    propname_test = collec_notion.find({"id":propname})
    if len(list(propname_test)) == 0:
        client.close()
        print("no propname found in server. refresh it first. propname : ",propname, rate, fromTest,ignorance, propdate)
        return -1
    

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
        return -1


    # find dataset.

    docs = collec.find_one({"id" : propname})

    if docs == None:
        docs = {todaystring : {"ignorance":ignorance, "rate_abs" : rate, "rate_rel" : "invalid"}, "id" : propname, "sub-collec":"rater"}
        collec.insert_one(docs)
    else:
        if todaystring in docs:
            docs[todaystring]["rate_abs"] = rate
            docs[todaystring]["ignorance"] = ignorance
        else:
            docs[todaystring] = {"ignorance":ignorance,"rate_abs" : rate, "rate_rel" : "invalid"}
        collec.replace_one({"id" : propname}, docs)

    # put and calculate the rate_rel
    docs = collec.find({"sub-collec":"rater",todaystring:{'$exists': 1}})
    docs = list(docs)

    rate_sum = 0
    prop_amount = 0
    for doc in  docs: 
        prop_amount += 1 
        rate_sum += doc[todaystring]["rate_abs"]

    for doc_2 in  docs:
        doc_2[todaystring]["rate_rel"] = Mathfunc.normal_rateRelCalc_limitPropAmount(prop_amount,doc_2[todaystring]["rate_abs"])
        doc_2_id = doc_2["id"]
        collec.replace_one({"id" : doc_2_id}, doc_2)
    
    client.close()
    return 1

def calc_getPointOfProp_depracated(propname, propdate, fromTest):
    propname = str(propname)
    propdate = str(propdate)
    fromTest = int(fromTest)


    selected_name = getName(0,1,fromTest,0)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    target_date = "invalid"
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
            sys.stdout.flush()
            return 1

    print(-1, "function ended")
    sys.stdout.flush()
    return -1

def calc_getPointOfProp_noflush(propname, propdate, fromTest):
    propname = str(propname)
    propdate = str(propdate)
    fromTest = int(fromTest)


    selected_name = getName(0,1,fromTest,0)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    target_date = "invalid"
    # find docs that has same id property.
    docs = collec.find_one({"id" : propname})
    if docs == None:
        # if there are no date : rate pairs, reject.
        return -1
        
    else:
        # find if there are any date match with our purpose.
        datetime_list = []
        for day in docs.keys():
            current_datetime = "invalid"
            try:
                if day[4] == "-" and day[7] == "-":
                    current_datetime = date.fromisoformat(day)
                    datetime_list.append(current_datetime)
            except Exception as exp:
                continue

        if len(datetime_list) == 0:
            # if there are no date : rate pairs, reject.
            return -1



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
        return -1
    else:
        #take the... "how long do you continuously keep your todo."
        client.close()
        continuous_num = checkHowContinuous(propname, propdate, 0,fromTest,0,ignorance=target_ignorance)
        final_point = Mathfunc.normal_rewardfunc(continuous_num) * target_rate
        if final_point >= 0 :
            return final_point

    print(-1, "function ended")
    return -1

def post_sRP_setAll(fromTest, rate, ignorance):
    fromTest = int(fromTest)
    selected_name = getName(0,0,fromTest,0)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]
    #override true line
    def calaculate_all(collec):
        doc_all = collec.find({})
        doc_all = list(doc_all)
        proceeded = list(map(elder_date_selector,doc_all))
        return proceeded

    def elder_date_selector(doc):
        propname = doc["id"]
        while True:
            if "_id" in doc:
                del(doc["_id"])
            if "id" in doc:
                del(doc["id"])
            if "sub-collec" in doc:
                del(doc["sub-collec"])
            break
        doc_ordered = list(doc.items())
        def sorter(target):
            return date.fromisoformat(target[0])
        doc_ordered.sort(key=sorter)
        doc_ordered[0] = for_all_date_in_doc_process(propname)(doc_ordered[0])

        doc[doc_ordered[0][0]] = doc_ordered[0][1]
        proceeded = dict(doc)
        return proceeded
    
    def for_all_date_in_doc_process(propname):
        def date_processer(item):
            key = item[0]
            value = item[1]
            if key == "_id":
                return (key, -1)
            try:
                if key[4] == "-" and key[7] == "-":
                    #then, key is propdate!
                    point = post_setRateOfProp_noflush(propname, rate, fromTest,ignorance, key)
                    return (key, point)
                else:
                    return (key, value)
            except IndexError:
                return (key, value)
        return date_processer
    
    #functional_excute
    calaculate_all(collec)

def calc_gPP_doAll(fromTest):
    fromTest = int(fromTest)
    selected_name = getName(0,0,fromTest,0)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]
    #override true line
    def calaculate_all(collec, client):
        doc_all = collec.find({})
        doc_all = list(doc_all)
        proceeded = list(map(doc_processor,doc_all))
        
        client.close()
        client = MongoClient(host='localhost', port=27017)
        selected_name = getName(0,1,fromTest,0)
        selected_col = selected_name[1]
        selected_name = selected_name[0]
        collec = client[selected_name][selected_col]
        for doc in proceeded:
            doc["sub-collec"] = "pointer"
            collec.replace_one({"sub-collec" : "pointer", "id":doc["id"]}, doc, upsert=True)

        return proceeded

    def doc_processor(doc):
        propname = doc["id"]
        proceeded = map(for_all_date_in_doc_process(propname),list(doc.items()))
        proceeded = dict(list(proceeded))
        del_keys = []
        for key in proceeded.keys():
            if proceeded[key] == -1:
                del_keys.append(key)
        for delkey in del_keys:
            del(proceeded[delkey])

        return proceeded
    
    def for_all_date_in_doc_process(propname):
        def date_processer(item):
            key = item[0]
            value = item[1]
            if key == "_id":
                return (key, -1)
            try:
                if key[4] == "-" and key[7] == "-":
                    #then, key is propdate!
                    point = calc_getPointOfProp_noflush(propname, key, fromTest)
                    return (key, point)
                else:
                    return (key, value)
            except IndexError:
                return (key, value)
        return date_processer
    
    #functional_excute
    proceeded_list_docAll = calaculate_all(collec, client)

def calc_gPP_updateOne(propdate, fromTest):
    fromTest = int(fromTest)

    selected_name = getName(0,1,fromTest,0)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    def search_and_updateOne(collec):
        docs = list(collec.find({'sub-collec': 'pointer'}))
        docs =  list(map(doc_processor,docs))
        result = list(map(doc_updatter,docs))
        return result
        
    def doc_processor(doc):
        doc[propdate] = calc_getPointOfProp_noflush(doc["id"], propdate, fromTest)
        return doc
    def doc_updatter(doc):
        collec.replace_one({'sub-collec': 'pointer', 'id':doc['id']},doc)
        return "Done!"

    result = search_and_updateOne(collec)
    #print(result)
    #sys.stdout.flush()   


def calc_setCommulativeOfPropAll(fromTest):
    fromTest = int(fromTest)

    selected_name = getName(0,1,fromTest,0)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    def add_commulative_pointers(collec):
        #take current calculation DB's pointer objs.
        current_calcDB = list(collec.find({'sub-collec': 'pointer'}))
        #and put the commulative pointers from that.
        commulativer_func = pointerdocs_to_commulative_lists(collec)
        commulative_lists = map(commulativer_func,current_calcDB)
        return list(commulative_lists)
    def pointerdocs_to_commulative_lists(collec):
        def child(doc):
            #this doc has all calculation point values about "the one property"
            #takes part in of docs to (key, value), remove other keys.
            doc_listized = list(doc.items())
            doc_listized = list(map(date_selector,doc_listized))
            while True:
                if -1 not in doc_listized:
                    break
                doc_listized.remove(-1)
            #sort the listized doc.
            doc_listized.sort(key=sorter)
            #calculate commulative_pointer
            commulativer_activate = commulativer()
            if commulativer_activate == -1:
                return -1
            doc_listized = list(map(commulativer_activate,doc_listized))

            #add the commulative pointers in the DB.
            commulative_doc = dict(doc_listized)
            commulative_doc["id"] = doc["id"]
            commulative_doc["sub-collec"] = "pointer_commulative"
            collec.replace_one({'sub-collec': 'pointer_commulative', "id":doc["id"]}, commulative_doc, upsert=True)
            return doc_listized
        return child
    def date_selector(item):
        key = item[0]
        value = item[1]
        if key == "id" or key == "_id" or key == "sub-collec":
            return -1
        else:
            return (key, value)
    def sorter(item):
        day = item[0]
        day = date.fromisoformat(day)
        return day
    def commulativer():
        pointsum = 0
        def child(item):
            nonlocal pointsum
            if item == -1:
                return -1
            pointsum += item[1]
            return (item[0],pointsum) #(key, commulated_pointer)
        return child


    result = add_commulative_pointers(collec)
    sys.stdout.flush()

def calc_sCO_updateOne(propdate, fromTest):
    fromTest = int(fromTest)

    selected_name = getName(0,1,fromTest,0)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    def search_and_updateOne(collec):
        docs = list(collec.find({'sub-collec': 'pointer_commulative'}))
        docs_noncommulative = list(collec.find({'sub-collec': 'pointer'}))
        doc_pairs = list(zip(docs, docs_noncommulative))
        docs =  list(map(doc_processor,doc_pairs))
        return list(map(doc_updattor,docs))
        
    def doc_processor(docpair):
        doc = docpair[0]
        doc_noncommu = docpair[1]

        propdate_before = date.isoformat(date.fromisoformat(propdate) - timedelta(days=1))
        commulative_before = doc[propdate_before]
        noncommu_now = doc_noncommu[propdate]

        doc[propdate] = commulative_before + noncommu_now

        return doc
    def doc_updattor(doc):
        collec.replace_one({'sub-collec': 'pointer_commulative', 'id':doc['id']},doc)
        return "Done!"


    result = search_and_updateOne(collec)
    #print(result)
    #sys.stdout.flush()   

if fget == "0":
    post_setRateOfProp_noflush(*fvar) #(propname, rate, fromTest,ignorance, propdate):
    print("Done!")
    sys.stdout.flush()
elif fget == "1":
    post_sRP_setAll(*fvar) #(fromTest, rate, ignorance) find eldest data in notionDB, ant fix its rate to $rate, $ignorance. safe to execute because earlist data won't be evaluated.
    print("Done!")
    sys.stdout.flush()
elif fget == "2" :
    calc_gPP_doAll(*fvar) #(fromTest)
    print("Done!")
    sys.stdout.flush()
elif fget == "3" : 
    calc_gPP_updateOne(*fvar) #(propdate, fromTest) update a date's points
    calc_sCO_updateOne(*fvar) #(propdate, fromTest) recalculate a date's commulative, by adding beforedate's commu and nowdate's point.
    print("Done!")
    sys.stdout.flush()
elif fget == "4" :
    calc_setCommulativeOfPropAll(*fvar) #(fromTest)
    print("Done!")
    sys.stdout.flush()
else:
    print("invalid input.")
    sys.stdout.flush()