from pymongo import MongoClient
from mongod_dbmanage import getName, checkHowContinuous
import sys
from datetime import date, timedelta, datetime

def writeLog(*strings):
    todaystring = datetime.today().strftime('%Y-%m-%d-%H:%M:%S')
    stringsum = ""
    for stri in strings:
        stringsum += str(stri) + " "
    with open("./main_log.txt", 'at') as file:
        file.write(todaystring +":"+ stringsum + "\n")

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

def post_setRateOfProp_noflush(dbname, dbcollec,propname, rate, fromTest,ignorance, propdate, overlap=True): #overlap False -> propname already in calc_rater_db then reject.
    dbname = int(dbname)
    dbcollec = int(dbcollec)
    propname = str(propname)
    rate = int(rate)
    fromTest = int(fromTest)
    ignorance = int(ignorance)
    # get name and collectionName

    selected_name = getName(dbname,1,fromTest,dbcollec)

    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    selected_notionName = getName(dbname,0,fromTest, dbcollec)
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
    if rate == 0:
        pass
    elif rate <= 1 :
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

    docs = collec.find_one({"id" : propname, "sub-collec":"rater"})

    if docs == None:
        docs = {todaystring : {"ignorance":ignorance, "rate_abs" : rate, "rate_rel" : "invalid"}, "id" : propname, "sub-collec":"rater"}
        collec.insert_one(docs)
    else:
        if overlap == False:
            return -1
        if todaystring in docs:
            docs[todaystring]["rate_abs"] = rate
            docs[todaystring]["ignorance"] = ignorance
        else:
            docs[todaystring] = {"ignorance":ignorance,"rate_abs" : rate, "rate_rel" : "invalid"}
        del(docs["_id"])
        collec.replace_one({"id" : propname,"sub-collec":"rater"}, docs, upsert=True)

    # put and calculate the rate_rel

    docs = collec.find({"sub-collec":"rater",todaystring:{'$exists': 1}})
    docs = list(docs)

    prop_amount = 0
    for doc in  docs: 
        if doc[todaystring]["rate_abs"] == 0:
            continue
        prop_amount += 1 

    for doc_2 in  docs:
        doc_2[todaystring]["rate_rel"] = Mathfunc.normal_rateRelCalc_limitPropAmount(prop_amount,doc_2[todaystring]["rate_abs"])
        doc_2_id = doc_2["id"]
        collec.replace_one({"id" : doc_2_id,"sub-collec":"rater"}, doc_2)
    
    client.close()
    return 1


def calc_getPointOfProp_noflush(dbname, dbcollec,propname, propdate, fromTest):
    dbname = int(dbname)
    dbcollec = int(dbcollec)
    propname = str(propname)
    propdate = str(propdate)
    fromTest = int(fromTest)


    selected_name = getName(dbname,1,fromTest,dbcollec)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    target_date = "invalid"
    # find docs that has same id property.
    doc = collec.find_one({'sub-collec': 'rater',"id" : propname})
    if doc == None:
        # if there are no date : rate pairs, reject.
        return -1
        
    else:
        # find latest date's rate.
        if "_id" in doc:
            del(doc["_id"])
        if "id" in doc:
            del(doc["id"])
        if "sub-collec" in doc:
            del(doc["sub-collec"])
        doc_tolist = list(doc.items())
        def sorter(item):
            return date.fromisoformat(item[0])
        doc_tolist.sort(key = sorter, reverse=True)
        
        count = 0
        while True:
            if count >= len(doc_tolist):
                target_date = doc_tolist[-1][0]
                break
            target_date = doc_tolist[count][0]
            if date.fromisoformat(target_date) <= date.fromisoformat(propdate):
                break
            count += 1


    target_rate = doc[target_date]["rate_rel"]
    target_ignorance = doc[target_date]["ignorance"]
    if target_rate == "invalid":
        client.close()
        print(-1,"rate_rel not calculated")
        return -1
    else:
        #take the... "how long do you continuously keep your todo."
        client.close()
        continuous_num = checkHowContinuous(propname, propdate, 0,fromTest,dbcollec,ignorance=target_ignorance)
        final_point = Mathfunc.normal_rewardfunc(continuous_num) * target_rate
        if final_point >= 0 :
            writeLog("hello",propname, propdate, final_point)
            return final_point

    print(-1, "function ended")
    return -1

def post_setRateForNew(dbname, dbcollec,fromTest, rate, ignorance):
    dbname = int(dbname)
    dbcollec = int(dbcollec)
    fromTest = int(fromTest)
    selected_name = getName(dbname,0,fromTest,dbcollec)
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
        if "_id" in doc:
            del(doc["_id"])
        if "id" in doc:
            del(doc["id"])
        if "sub-collec" in doc:
            del(doc["sub-collec"])
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
                    point = post_setRateOfProp_noflush(dbname, dbcollec,propname, rate, fromTest,ignorance, key, overlap=False)
                    return (key, point)
                else:
                    return (key, value)
            except IndexError:
                return (key, value)
        return date_processer
    
    #functional_excute
    calaculate_all(collec)
    client.close()

def calc_setPointForNew(dbname, dbcollec, fromTest):
    dbname = int(dbname)
    dbcollec = int(dbcollec)
    fromTest = int(fromTest)
    selected_name = getName(dbname,0,fromTest,dbcollec)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]
    #override true line
    def calaculate_all(collec, client):
        doc_all = collec.find({})
        doc_all = list(doc_all)

        selected_name = getName(dbname,1,fromTest,dbcollec)
        selected_col = selected_name[1]
        selected_name = selected_name[0]
        collec_calc = client[selected_name][selected_col]

        proceeded = list(map(doc_processor(collec_calc),doc_all))

        for doc in proceeded:
            doc["sub-collec"] = "pointer"
            collec_calc.replace_one({"sub-collec" : "pointer", "id":doc["id"]}, doc, upsert=True)

        return proceeded

    def doc_processor(collec_calc):
        def child(doc):
            propname = doc["id"]
            proceeded = map(for_all_date_in_doc_process(propname, collec_calc),list(doc.items()))
            proceeded = dict(list(proceeded))
            del_keys = []
            for key in proceeded.keys():
                if proceeded[key] == -1:
                    del_keys.append(key)
            for delkey in del_keys:
                del(proceeded[delkey])

            return proceeded
        return child
    
    def for_all_date_in_doc_process(propname,collec_calc):
        def date_processer(item):
            key = item[0]
            value = item[1]
            if key == "_id":
                return (key, -1)
            try:
                if key[4] == "-" and key[7] == "-":
                    #then, key is propdate!
                    already_exists = collec_calc.find_one({"sub-collec" : "pointer", "id":propname, key:{"$exists" :1}})
                    if  already_exists != None:
                        return (key, already_exists[key])
                    point = calc_getPointOfProp_noflush(dbname, dbcollec,propname, key, fromTest, )
                    return (key, point)
                else:
                    return (key, value)
            except IndexError:
                return (key, value)
        return date_processer
    
    #functional_excute
    proceeded_list_docAll = calaculate_all(collec, client)
    client.close()

def calc_updatePointOfWeek(dbname, dbcollec,propdate, fromTest):
    dbname = int(dbname)
    dbcollec = int(dbcollec)
    fromTest = int(fromTest)

    selected_name = getName(dbname,1,fromTest,dbcollec)
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
        propdate_countable = date.fromisoformat(propdate)
        propday = propdate_countable.weekday()
        for i in range(propday+1):
            propdate_now = propdate_countable.isoformat()
            doc[propdate_now] = calc_getPointOfProp_noflush(dbname, dbcollec,doc["id"], propdate_now, fromTest)
            propdate_countable -= timedelta(days=1)
        return doc
    def doc_updatter(doc):
        collec.replace_one({'sub-collec': 'pointer', 'id':doc['id']},doc)
        return "Done!"

    result = search_and_updateOne(collec)
    #print(result)
    #sys.stdout.flush()   


def calc_setCommulativeOfPropAll(dbname, dbcollec,fromTest):
    dbname = int(dbname)
    dbcollec = int(dbcollec)
    fromTest = int(fromTest)

    selected_name = getName(dbname,1,fromTest,dbcollec)
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
            already_exists = collec.find_one({'sub-collec': 'pointer_commulative',"id":doc["id"]})
            if already_exists != None:
                # if there is already commulative proppointer, this function can't do anything.
                return -1
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
    client.close()

def calc_updateComuPointOfWeek(dbname, dbcollec,propdate, fromTest):
    #writeLog(dbname, dbcollec,propdate, fromTest)
    dbname = int(dbname)
    dbcollec = int(dbcollec)
    fromTest = int(fromTest)

    selected_name = getName(dbname,1,fromTest,dbcollec)
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

        propdate_now = date.fromisoformat(propdate)
        propday = propdate_now.weekday()
        propdate_before = date.fromisoformat(propdate) - timedelta(days=1)

        #for commulative, inverse search operate.
        propdate_now -= timedelta(days=propday)
        propdate_before -= timedelta(days=propday) #+1 is for the week changes. so, this func calculate more than week, actually.
        for i in range(propday+1):
            propdate_before_str = propdate_before.isoformat()
            propdate_now_str = propdate_now.isoformat()
            if propdate_before_str in doc :
                commulative_before = doc[propdate_before_str]
            else:
                commulative_before = 0

            if propdate_now_str in doc_noncommu:
                noncommu_now = doc_noncommu[propdate_now_str]
                doc[propdate_now_str] = commulative_before + noncommu_now # insertion happening section
                propdate_before += timedelta(days=1)
                propdate_now += timedelta(days=1)
            else:
                propdate_before += timedelta(days=1)
                propdate_now += timedelta(days=1)

        return doc
    def doc_updattor(doc):
        collec.replace_one({'sub-collec': 'pointer_commulative', 'id':doc['id']},doc) # final update section
        return "Done!"


    result = search_and_updateOne(collec)
    client.close()
    #print(result)
    #sys.stdout.flush()   

def post_updateRateOfWeek(dbname, dbcollec,propdate, fromTest):
    dbname = int(dbname)
    dbcollec = int(dbcollec)
    fromTest = int(fromTest)

    selected_name = getName(dbname,1,fromTest,dbcollec)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    def search_and_updateOne(collec):
        docs = list(collec.find({'sub-collec': 'rater'}))
        docs =  list(map(doc_processor,docs))
        
    def doc_processor(doc):
        propdate_countable = date.fromisoformat(propdate)
        propday = propdate_countable.weekday()
        for i in range(propday+1):
            propdate_now = propdate_countable.isoformat()
            if propdate_now in doc:
                post_setRateOfProp_noflush(dbname, dbcollec,doc["id"], doc[propdate_now]["rate_abs"], fromTest,doc[propdate_now]["ignorance"], propdate_now)
            propdate_countable -= timedelta(days=1)
        return doc

    result = search_and_updateOne(collec)
    client.close()
    #print(result)
    #sys.stdout.flush()   

def post_f_makeRatesExistsThatDate(dbname, dbcollec,propdate, fromTest):
    dbname = int(dbname)
    dbcollec = int(dbcollec)
    fromTest = int(fromTest)

    selected_name = getName(dbname,1,fromTest,dbcollec)
    client = MongoClient(host='localhost', port=27017)
    selected_col = selected_name[1]
    selected_name = selected_name[0]
    collec = client[selected_name][selected_col]

    def search_and_updateOne(collec):
        docs = list(collec.find({'sub-collec': 'rater'}))
        docs =  list(map(doc_processor,docs))
        
    def doc_processor(doc):
        # find latest date's rate.
        propname = doc["id"]
        if "_id" in doc:
            del(doc["_id"])
        if "id" in doc:
            del(doc["id"])
        if "sub-collec" in doc:
            del(doc["sub-collec"])
        doc_tolist = list(doc.items())
        def sorter(item):
            return date.fromisoformat(item[0])
        doc_tolist.sort(key = sorter, reverse=True)
        
        count = 0
        latest_date = "invalid"
        while True:
            if count >= len(doc_tolist):
                latest_date = doc_tolist[-1][0]
                break
            latest_date = doc_tolist[count][0]
            if date.fromisoformat(latest_date) <= date.fromisoformat(propdate):
                break
            count += 1
        assemble_rater = doc[latest_date]
        post_setRateOfProp_noflush(dbname, dbcollec,propname, assemble_rater["rate_abs"], fromTest,assemble_rater["ignorance"], propdate)


    result = search_and_updateOne(collec)
    client.close()
    #print(result)
    #sys.stdout.flush()   


def post_faultRateZeroSwitch(dbname, dbcollec,fromTest, restorerate, restoreignorance):
    dbname = int(dbname)
    dbcollec = int(dbcollec)
    fromTest = int(fromTest)
    today = date.fromisoformat(date.today().isoformat())
    #debug : change today if test
    client = MongoClient(host='localhost', port=27017)
    collec = client["OPERATION_MODE_system"]["base"]
    debug_doc = collec.find_one({})
    if "testdate" in debug_doc:
        today = date.fromisoformat(debug_doc["testdate"])


    selected_name = getName(dbname,0,fromTest,dbcollec) # get DB from notionDB
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
        if "_id" in doc:
            del(doc["_id"])
        if "id" in doc:
            del(doc["id"])
        if "sub-collec" in doc:
            del(doc["sub-collec"])
        doc_ordered = list(doc.items())
        def sorter(target):
            return date.fromisoformat(target[0])
        doc_ordered.sort(key=sorter)
        newest_date_str = doc_ordered[-1][0]
        #writeLog(propname, newest_date_str, doc_ordered, today.isoformat())
        newest_date = date.fromisoformat(newest_date_str)
        if newest_date < today: # target to make zero
            zerorate_date_str = date.isoformat(newest_date + timedelta(days=1))
            # make that prop zero.
            post_setRateOfProp_noflush(dbname, dbcollec,propname, 0, fromTest,1, zerorate_date_str)
            # modify the other props too.
            post_f_makeRatesExistsThatDate(dbname, dbcollec,zerorate_date_str, fromTest)
        else:    #target to restore check. if one has newest_date rater -> rateabs=0 however newest_date == today
            #has the newest_date -> rateabs=0?
            selected_name = getName(dbname,1,fromTest,dbcollec) # get DB from notionDB
            selected_col = selected_name[1]
            selected_name = selected_name[0]
            collec_rater = client[selected_name][selected_col]
            rater_doc = collec_rater.find_one({"id" : propname, "sub-collec":"rater"})
            
            if newest_date_str in rater_doc:
                if rater_doc[newest_date_str]["rate_abs"] == 0:
                    #restore that rater.
                    post_setRateOfProp_noflush(dbname, dbcollec,propname, restorerate, fromTest,restoreignorance, newest_date_str)
                    # modify the other props too.
                    post_f_makeRatesExistsThatDate(dbname, dbcollec,newest_date_str, fromTest)

    
    
    #functional_excute
    calaculate_all(collec)
    client.close()




if fget == "0":
    post_setRateOfProp_noflush(*fvar) #(dbname, dbcollec,propname, rate, fromTest,ignorance, propdate):
    print("Done!")
    sys.stdout.flush()
elif fget == "1":
    post_setRateForNew(*fvar) #(dbname, dbcollec,fromTest, rate, ignorance) find eldest data in notionDB, 
    post_setRateForNew(*fvar) #and fix its rate to $rate, $ignorance. safe to execute because earlist data won't be evaluated.
                              #only create for new propname, don't touching every existing proprate.     

    post_faultRateZeroSwitch(*fvar) #if there are some prop that maindb(notion) date is fewer then other prop, make its rate_abs to 0. or restore back.
    print("Done!")         
    sys.stdout.flush()
elif fget == "2" :
    calc_setPointForNew(*fvar) #(dbname, dbcollec,fromTest)
    print("Done!")        #only create for new propname, don't touching every existing prop points.
    sys.stdout.flush()
elif fget == "3" : 
    post_updateRateOfWeek(*fvar) # (dbname, dbcollec,propdate, fromTest) new prop added -> rate_rel could be changed cause by prop amount limitation func.
                                 #  WARN: it UPDATEs the proprate in the week, not MAKE it. so there must be already a rater exists.
    calc_updatePointOfWeek(*fvar) #(dbname, dbcollec,propdate, fromTest) update a date's points
    calc_updateComuPointOfWeek(*fvar) #(dbname, dbcollec,propdate, fromTest) recalculate a date's commulative, by adding beforedate's commu and nowdate's point.
    print("Done!")                 #calc_updateComuPointOfWeek can also calculate "have no commulative pointers but have just pointers".
    sys.stdout.flush()
elif fget == "4" :
    calc_setCommulativeOfPropAll(*fvar) #(dbname, dbcollec,fromTest) only create for new propname, don't touching every existing prop points.
    print("Done!")                      #there can be one that have no commulative pointers but have just pointers. 
    sys.stdout.flush()                  #but, calulation of them are for the calc_updateComuPointOfWeek's work.
elif fget == "5" :
    print("Test Done!")
    sys.stdout.flush()
else:
    print("invalid input.")
    sys.stdout.flush()