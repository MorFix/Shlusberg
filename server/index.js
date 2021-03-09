const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { getResponses, addQuestionResponse } = require('./responses-api');

app.use(cors());
app.use(express.static('../client/dist'));

app.use(bodyParser.json({ limit: '10mb', extended: true }));

app.get('/response', (req, res) => {
    res.json(getResponses());
});

app.post('/response', (req, res) => {
    const { questionsResponses, userName } = req.body;

    questionsResponses.forEach(questionResponse => {
        addQuestionResponse(questionResponse, { userName, remoteIp: req.socket.remoteAddress })
    });

    res.end();
});

const PORT = 80;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});
