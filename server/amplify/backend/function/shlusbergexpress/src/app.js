/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var cors = require('cors');
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const { getResponses, addQuestionResponse } = require('./responses-api');

app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext())
app.use(cors());


app.get('/response', (req, res) => {
  res.json(getResponses());
});

app.post('/response', (req, res) => {
  const { questionsResponses, userName } = req.body;

  questionsResponses.forEach(questionResponse => {
      addQuestionResponse(questionResponse, { name: userName, remoteIp: req.socket.remoteAddress })
  });

  res.end();
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});


// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
