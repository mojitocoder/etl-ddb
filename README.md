Extract Transform Load Data to DynamoDB
===

This project contain the source code for the article [How to quickly load a large amount of records to AWS DynamoDB](https://mojitocoder.medium.com/how-to-quickly-load-a-large-amount-of-records-to-aws-dynamodb-94524ea249dc).

## Initial setup

1. Clone the project to the local machine

   ```bash
   git clone https://github.com/mojitocoder/etl-ddb.git
   ```

2. Install dependencies

   ```bash
   cd etl-ddb
   npm install
   ```

3. Create the `Postcodes` table in DynamoDB

   ```bash
   cd local_scripts
   node createTable.js
   ```
   
   

## Using Lambda to load UK postcodes to DynamoDB

1. Deploy the project

   ```bash
   npm run sls -- deploy
   ```

   The Serverless framework will create a ``Postcodes` table in DynamoDB and a Lambda named `etl-ddb-dev-loadPostcodes`.

2. Trigger the Lambda to load data into the `Postcodes` table of DynamoDB

   ```bash
   aws lambda invoke --region eu-west-1 \
   --function-name etl-ddb-dev-loadPostcodes out --log-type Tail \
   --query 'LogResult' --output text |  base64 -d
   ```
   
   

## Run local Node.js programs to load UK postcodes to DynamoDB

If you prefer not to use Lambda to load data to DynamoDB, you can do it from your local development environment.

1. Make sure you are in the `local_scripts` folder

   ```bash
   cd etl-ddb
   cd local_scripts
   ```
   
   
   
2. Download UK postcode geo data file

   ```bash
   curl https://www.freemaptools.com/download/full-postcodes/ukpostcodes.zip --output ukpostcodes.zip
   ```

   

3. Unzip the file
   ```bash
   unzip -a ukpostcodes.zip
   ```
   
   
   
4. If you have not deployed the serverless project, you will need to create the `Postcodes` table in DynamoDB manually

   ```bash
   node createTable.js
   ```

   

There are three versions of the program to run:

1. `lineByLine.js` is the slowest one, it would take more than 2 days to finish.
2. `writeInBatches.js` is faster, taking around 2h.
3. `concurrentRequests.js` uses the same logic as the Lambda version and it's the quickest to run. It should take 15 minutes.

## Useful AWS SDK commands

1. See the detail of the DynamoDB table

   ```bash
   aws dynamodb --region eu-west-1 describe-table --table-name    Postcodes
   ```

   

2. Scan the DynamoDB table

   ```bash
   aws dynamodb --region eu-west-1 scan \
   --table-name Postcodes
   ```

3. Delete a DynamoDB table

   ```bash
   aws dynamodb --region eu-west-1 delete-table \
   --table-name Postcodes
   ```

4. List tables in DynamoDB

   ```bash
   aws dynamodb list-tables --region eu-west-1
   ```
   
   
