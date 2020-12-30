const AWS = require('aws-sdk')
const fs = require('fs')
const readline = require('readline')
const https = require('https')
const extract = require('extract-zip')

const batchSize = 25
const concurrentRequests = 40

process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = 1

const dynamodb = new AWS.DynamoDB.DocumentClient()

function convertToObject (line) {
  const items = line.split(',')
  if (items.length === 4 && items[2].trim().length > 0 && items[3].trim().length > 0) {
    return {
      postcode: items[1].replace(' ', ''),
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
}

async function processFile (fileName) {
  const readStream = fs.createReadStream(fileName, { encoding: 'utf8' })
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  })

  let firstLine = true
  let items = []
  let promises = []
  let i = 0
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
      promises.push(saveToDynamoDB(items))

      if (promises.length % concurrentRequests === 0) {
        // console.log('awaiting write requests to DynamoDB')
        await Promise.all(promises)
        promises = []
      }

      items = []
    }

    i++
    if (i % 100000 === 0) {
      console.log('Processed lines:', i)
    }
  }

  if (items.length > 0) {
    promises.push(saveToDynamoDB(items))
  }

  if (promises.length > 0) {
    await Promise.all(promises)
  }

  console.log('Total processed lines:', i)
}

async function downloadFile (url, fileName) {
  const writableStream = fs.createWriteStream(fileName)
  return new Promise((resolve, reject) => {
    const request = https.get(url, function (response) {
      response.pipe(writableStream)
      response.on('end', () => {
        writableStream.close()
        resolve()
      })
    })

    request.on('error', reject)
  })
}

async function unzipFile (fileName, targetDir) {
  await extract(fileName, {
    dir: targetDir
  })
}

module.exports = {
  downloadFile,
  unzipFile,
  processFile
}
