const { Client } = require("@notionhq/client")

const fs = require("fs")

const notion = new Client({ auth: fs.readFileSync("notionkeys.key","utf8") })


const IDStore_passorfail = {"todoID" : "fd644186c73345438d5c4ce2c8cfb2ca",
"studyID" : "2049fe58d92f417b979c0209f9462de4",
"catID" : "9b797bb26dfe4f97b0a8c67647dc4c2e",
"projectsID" : "fc1785afaa5c4883af9819154381f0ea"}

const IDstore_pageamount = {
  "rank_1" : "ac126e4ba78d4063b84fd23f6fe8bb5a"
}

const moment = require('moment');
require("moment-timezone")
moment.tz.setDefault("Asia/Seoul")

const istest = require("../serverIsTest/index")

async function getIDfromCollecNum(dbnum, dbcollec)
{
  var IDStore
  if (dbnum == 0) {IDStore = IDStore_passorfail}
  else if (dbnum == 1) {IDStore = IDstore_pageamount}

  dbcollec = Number(dbcollec)
  IDStore_arr = Object.entries(IDStore)
  var idName = IDStore_arr[dbcollec][0]
  return IDStore[idName]
}

//pageamount DBname's methods



// passorfail DBname's methods
async function getItemNOTION_passorfail(databaseId) {
  try {
    //prepare to change day of week to date
    var currnet_date = moment()
    var istest_date = await istest.TESTDATE_GET()
    if (istest_date !== -1)
    {
      currnet_date = moment(istest_date, "YYYY-MM-DD")
    }
    var current_day = (Number(currnet_date.format("d")) +6 ) % 7  // starts at 0=monday, ends at 6=sunday.
    var week = [false, false, false, false, false, false, false]

    for(let i=current_day; i>=0; i--)
    {
      week[i] = currnet_date.format("YYYY-MM-DD")
      currnet_date.subtract(1,'days')
    }

    const response = await notion.databases.query({
      database_id : databaseId,
      })
    console.log("Success!")

    var result = response["results"]
    var calender = new Array(result.length)

    for (var i=0; i<result.length; i++)
    {
      var page = result[i]
      var prop = page["properties"]
      for (key in prop )
      {
        var valuetable = prop[key]
        var type = valuetable["type"]
        var innerData = valuetable[type]
        if (typeof(innerData) === "boolean")
        {
          if (key === "월" && week[0] !== false ){
            prop[week[0]] = innerData
          } else if (key === "화" && week[1] !== false ) {
            prop[week[1]] = innerData
          } else if (key === "수" && week[2] !== false ) {
            prop[week[2]] = innerData
          } else if (key === "목" && week[3] !== false ) {
            prop[week[3]] = innerData
          } else if (key === "금" && week[4] !== false ) {
            prop[week[4]] = innerData
          } else if (key === "토" && week[5] !== false ) {
            prop[week[5]] = innerData
          } else if (key === "일" && week[6] !== false ) {
            prop[week[6]] = innerData
          } 
          delete prop[key]
        }
        else if (key === "할 일")
        {
          prop["id"] = innerData[0].plain_text
          delete prop[key]
        }
        else
        {
          delete prop[key]
        }

      }
      calender[i] = prop
    }

    return calender
  } catch (error) {
    console.error(error.body)
  }
}

async function getItem_seletDate(databaseId, datestring) // YYYY-MM-DD
{
  try {
    //prepare to change day of week to date
    var currnet_date = moment(datestring,"YYYY-MM-DD")
    //currnet_date.subtract(3,"days")//--debug
    var current_day = (Number(currnet_date.format("d")) +6 ) % 7
    if (current_day == 0) 
    {
      console.log("invaild datetime. testdb adding rejected.")
      return -1
    }
    var monday = moment(datestring,"YYYY-MM-DD")
    //monday.subtract(3,"days")//--debug
    monday = monday.subtract(current_day+1, 'days')
    var week = Array(7)
    var count = 0
    for (var i=0; i<7;i++)
    {
      var dateText = monday.add(1,'days').format("YYYY-MM-DD")
      var difference = Math.ceil(currnet_date.diff(monday,"days",true))
      if (1 + difference <= 0 || dateText === 'Invalid date')
      {
        week[i] = false
        count  = count + 1
      } 
      else 
      {
        week[i] = dateText
      }
    }
    if (count === 7 ) {return -1}

    const response = await notion.databases.query({
      database_id : databaseId,
      })
    console.log("Success!")

    var result = response["results"]
    var calender = new Array(result.length)

    for (var i=0; i<result.length; i++)
    {
      var page = result[i]
      var prop = page["properties"]
      for (key in prop )
      {
        var valuetable = prop[key]
        var type = valuetable["type"]
        var innerData = valuetable[type]
        if (typeof(innerData) === "boolean")
        {
          if (key === "월" && week[0] !== false ){
            prop[week[0]] = innerData
          } else if (key === "화" && week[1] !== false ) {
            prop[week[1]] = innerData
          } else if (key === "수" && week[2] !== false ) {
            prop[week[2]] = innerData
          } else if (key === "목" && week[3] !== false ) {
            prop[week[3]] = innerData
          } else if (key === "금" && week[4] !== false ) {
            prop[week[4]] = innerData
          } else if (key === "토" && week[5] !== false ) {
            prop[week[5]] = innerData
          } else if (key === "일" && week[6] !== false ) {
            prop[week[6]] = innerData
          } 
          delete prop[key]
        }
        else if (key === "할 일")
        {
          prop["id"] = innerData[0].plain_text
          delete prop[key]
        }
        else
        {
          delete prop[key]
        }

      }
      calender[i] = prop
    }

    return calender
  } catch (error) {
    console.error(error.body)
  }
}

async function testsetget_passorfail(databaseId, datestring)
{
  var testcalender = await getItem_seletDate(databaseId,datestring)
  if (testcalender == -1) {return -1}
  for (propkey in testcalender)
  {
    var prop = testcalender[propkey]
    for (date in prop)
    {
      if (date == 'id')
      {
        continue
      }
      const randbool = Math.random() < 0.5
      testcalender[propkey][date] = randbool
    }
  }

  return testcalender
}                                                   


exports.getItemNOTION_passorfail = getItemNOTION_passorfail
exports.testsetget_passorfail = testsetget_passorfail
exports.getIDfromCollecNum = getIDfromCollecNum