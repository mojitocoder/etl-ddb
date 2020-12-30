const AWS = require('aws-sdk')
const fs = require('fs')
const fileName = 'ukpostcodes.csv'
const batchSize = 25
const concurrentRequests = 40
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
}

async function saveToDynamoDB (items) {
  const putReqs = items.map(item => ({
    PutRequest: {
      Item: item
    }
  }))

  const req = {
    RequestItems: {
      Postcodes: putReqs
    }
  }

  await dynamodb.batchWrite(req).promise()
};

(async function () {
  const readStream = fs.createReadStream(fileName, { encoding: 'utf8' })
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  })

  let firstLine = true
  let items = []
  let batchNo = 0
  let promises = []
  for await (const line of rl) {
    if (firstLine) {
      firstLine = false
      continue
    }

    const obj = convertToObject(line)
    if (obj) {
      items.push(convertToObject(line))
    }

    if (items.length % batchSize === 0) {
      console.log(` batch ${batchNo}`)

      promises.push(saveToDynamoDB(items))
      if (promises.length % concurrentRequests === 0) {
        console.log('\nawaiting write requests to DynamoDB\n')
        await Promise.all(promises)
        promises = []
      }

      items = []
      batchNo++
    }
  }

  if (items.length > 0) {
    console.log(` batch ${batchNo}`)
    promises.push(saveToDynamoDB(items))
  }

  if (promises.length > 0) {
    console.log('\nawaiting write to DynamoDB\n')
    await Promise.all(promises)
  }

  console.log('Job done')
})()
