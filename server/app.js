const ACCESS_KEY = 'Aa123456'

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { getResponses, addQuestionResponse } = require('./responses-api');

app.use(cors());
app.use(express.static('../client/dist'));

app.use(bodyParser.json({ limit: '10mb', extended: true }));

const keyMiddleware = (req, res, next) => {
    if (req.query['key'] === ACCESS_KEY) {
        next();

        return;
    }

    res.status(403)
    res.send({error: 'Forbidden'})
};

app.get('/response', keyMiddleware, (req, res) => {
    res.json(getResponses());
});

app.post('/response', (req, res) => {
    const { questionsResponses, userName } = req.body;

    questionsResponses.forEach(questionResponse => {
        addQuestionResponse(questionResponse, { name: userName, remoteIp: req.socket.remoteAddress })
    });

    res.end();
});

const PORT = 80;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});
