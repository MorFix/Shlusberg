const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors())
app.use(express.static('./public'));
app.use(bodyParser.json({limit: '10mb', extended: true}));

const questions = [];

const isUserResponse = (response, userName, remoteIp) => response.userName === userName && response.remoteIp === remoteIp;

const deleteQuestion = question => questions.splice(questions.indexOf(question), 1);

const deleteResponse = (response, question) => {
    question.responses.splice(question.responses.indexOf(response), 1);
    
    if (!question.responses.length) {
        deleteQuestion(question);
    }
};

const addResponse = ({answerContent, questionContent, userName, remoteIp}) => {
    let existingQuestion = questions.find(({content}) => content === questionContent);
    let isNewQuestion = !existingQuestion;

    if (!existingQuestion) {
        existingQuestion = {content: questionContent, responses: []};
        questions.push(existingQuestion);
    }

    const existingUserResponse = existingQuestion.responses.find(x => isUserResponse(x, userName, remoteIp));

    if (answerContent === null && existingUserResponse) {
        deleteResponse(existingUserResponse, existingQuestion);
    } else if (existingUserResponse) {
        existingUserResponse.answerContent = answerContent;
    } else if (answerContent) {
        existingQuestion.responses.push({answerContent, userName, remoteIp});
    } else if (isNewQuestion) {
        deleteQuestion(existingQuestion);
    }
};

app.get('/responses', (req, res) => {
    res.json(questions);
});

const handleNewResponse = (req, res) => {
    addResponse({...req.body, remoteIp: req.socket.remoteAddress});

    res.end();
};

app.post('/responses', handleNewResponse);

// Backwards compatibility
app.post('/answers', handleNewResponse);

app.listen(80, () => {
    console.log(`Listening...`);
});
