const { Client } = require("@notionhq/client")

const fs = require("fs")

const notion = new Client({ auth: fs.readFileSync("notionkeys.key","utf8") })

//fd644186c73345438d5c4ce2c8cfb2ca a5ff1a4fa3c548b992186a05a32cfb1b
const workId = "fd644186c73345438d5c4ce2c8cfb2ca"

const moment = require('moment');
require("moment-timezone")
moment.tz.setDefault("Asia/Seoul")

async function getItem(databaseId) {
  try {
    //prepare to change day of week to date
    var currnet_date = moment()
    //currnet_date.subtract(3,"days")//--debug
    var current_day = (Number(currnet_date.format("d")) +6 ) % 7
    var monday = moment()
    //monday.subtract(3,"days")//--debug
    monday = monday.subtract(current_day+1, 'days')
    var week = Array(7)
    for (var i=0; i<7;i++)
    {
      var dateText = monday.add(1,'days').format("YYYY-MM-DD")
      var difference = Math.ceil(currnet_date.diff(monday,"days",true))
      if (1 + difference <= 0)
      {
        week[i] = false
      } 
      else 
      {
        week[i] = dateText
      }
    }
    //

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
    for (var i=0; i<7;i++)
    {
      var dateText = monday.add(1,'days').format("YYYY-MM-DD")
      console.log(dateText)
      var difference = Math.ceil(currnet_date.diff(monday,"days",true))
      if (1 + difference <= 0 || dateText === 'Invalid date')
      {
        week[i] = false
      } 
      else 
      {
        week[i] = dateText
      }
    }
    //

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

async function testsetget(databaseId, datestring)
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


exports.getItemNOTION = getItem
exports.workId = workId
exports.testsetget = testsetget


