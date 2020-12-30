const AWS = require('aws-sdk')
const fs = require('fs')
const fileName = 'ukpostcodes.csv'
const readline = require('readline')

AWS.config.update({
  region: 'eu-west-1'
})

const dynamodb = new AWS.DynamoDB.DocumentClient()

function convertToObject (line) {
  const items = line.split(',')
  if (items.length === 4 && items[2].trim().length > 0 && items[3].trim().length > 0) {
    return {
      postcode: items[1].replaceAll(' ', ''),
      latitude: parseFloat(items[2]),
      longitude: parseFloat(items[3])
    }
  } else return null
};

(async function () {
  const startTime = Date.now()
  const readStream = fs.createReadStream(fileName, { encoding: 'utf8' })
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  })

  let firstLine = true
  for await (const line of rl) {
    if (firstLine) {
      firstLine = false
      continue
    }

    const obj = convertToObject(line)
    if (obj) {
      const req = {
        Item: obj,
        TableName: 'Postcodes'
      }

      await dynamodb.put(req).promise()
    }
  }

  const takenSecs = (Date.now() - startTime) / 1000
  console.log(`Job done in ${takenSecs} seconds`)
})()
