const { Client } = require("@notionhq/client")

const fs = require("fs")

const notion = new Client({ auth: fs.readFileSync("keys.key","utf8") })

//fd644186c73345438d5c4ce2c8cfb2ca a5ff1a4fa3c548b992186a05a32cfb1b
const hobbyId = "a5ff1a4fa3c548b992186a05a32cfb1b"
const workId = "fd644186c73345438d5c4ce2c8cfb2ca"

async function getItem(databaseId) {
  try {
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
          prop[key] = innerData
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

    console.log(calender)
  } catch (error) {
    console.error(error.body)
  }
}

exports.getItemNOTION = getItem


