const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors())
app.use(express.static('./public'));
app.use(bodyParser.json());

const questions = [];

const isAnswerForUser = (answer, userName, remoteIp) => answer.userName === userName && answer.remoteIp === remoteIp;

const clean = html => {
    return html;
};

const addAnswer = (answer, remoteIp) => {
    const questionContent = clean(answer.questionContent);
    let existingQuestion = questions.find(x => x.content === questionContent);
    
    if (!existingQuestion) {
        existingQuestion = {content: questionContent, answers: []};
        questions.push(existingQuestion);
    }

    const currentAnswerForUser = existingQuestion.answers.find(x => isAnswerForUser(x, answer.userName, remoteIp));
    const answerContent = clean(answer.answerContent);

    if (!currentAnswerForUser) {
        existingQuestion.answers.push({remoteIp, userName: answer.userName, content: answerContent});
    } else {
        currentAnswerForUser.content = answerContent;
    }
};

app.get('/answers', (req, res) => {
    res.json(questions);
});

app.post('/answers', (req, res) => {
    addAnswer(req.body, req.socket.remoteAddress);

    res.end();
});

app.listen(80, () => {
    console.log(`Listening...`);
});
