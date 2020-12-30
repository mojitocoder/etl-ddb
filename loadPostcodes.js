const { processFile, downloadFile, unzipFile } = require('./lib')

const handle = async event => {
  const startTime = Date.now()

  try {
    console.log('Download started')
    const fileName = '/tmp/ukpostcodes.zip'
    await downloadFile('https://www.freemaptools.com/download/full-postcodes/ukpostcodes.zip', fileName)
    console.log('Download done')

    console.log('Unzip started')
    await unzipFile(fileName, '/tmp')
    console.log('Unzip done')

    console.log('Start loading postcodes into DynamoDB')
    await processFile('/tmp/ukpostcodes.csv')
  } catch (error) {
    console.error(error)
  }

  const timeTakenSecs = (Date.now() - startTime) / 1000
  console.log(`Job done in ${timeTakenSecs} seconds`)

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `UK postcodes loaded into DynamoDB successfully in ${timeTakenSecs} seconds`
      }
    )
  }
}

module.exports = {
  handle
}
