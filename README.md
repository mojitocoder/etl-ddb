ETL Data to DynamoDB
===

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

1. Get the ARN of DynamoDB's `Postcodes` table

   ```bash
   aws dynamodb --region eu-west-1 describe-table --table-name Postcodes
   ```

   `TableArn` is the value you need to keep. It should look like `arn:aws:dynamodb:eu-west-1:xxxxxxxxxxxx:table/Postcodes`

2. Grant the to-be-created Lambda permission to insert data into DynamoDB by putting the ARN retrieved in the previous step to `Resource` value on line 12 of `serverless.yml`.

3. Deploy the serverless project, make sure you run this from the root folder of the project, e.g. `etl-ddb/` (and not inside `etl-ddb/local_scripts/`)

   ```bash
   serverless deploy
   ```

   The Serverless framework will go ahead and create a Lambda for us with the name of `etl-ddb-dev-loadPostcodes`

4. Trigger the Lambda to load data into the `Postcodes` table of DynamoDB

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
   curl https://www.freemaptools.com/download/full-postcodes/ukpostcodes.zip --    output ukpostcodes.zip
   ```

3. Unzip the file
   ```bash
   unzip -a ukpostcodes.zip
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
