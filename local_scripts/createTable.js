const AWS = require('aws-sdk')

AWS.config.update({
  region: 'eu-west-1'
})

const dynamodb = new AWS.DynamoDB()

async function createTable () {
  const params = {
    TableName: 'Postcodes',
    KeySchema: [
      { AttributeName: 'postcode', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'postcode', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }

  await dynamodb.createTable(params).promise()
};

(async function () {
  await createTable()
}())
