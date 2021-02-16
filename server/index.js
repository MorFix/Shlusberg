const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors())
app.use(express.static('./public'));
app.use(bodyParser.json({limit: '10mb', extended: true}));

const questions = [];

const isAnswerForUser = (answer, userName, remoteIp) => answer.userName === userName && answer.remoteIp === remoteIp;

const clean = html => {
    return html;
};

const deleteQuestion = question => questions.splice(questions.indexOf(question));

const deleteAnswer = (answer, question) => {
    question.answers.splice(question.answers.indexOf(answer), 1);
    if (!question.answers.length) {
        deleteQuestion(question);
    }
};

const addAnswer = (answer, remoteIp) => {
    const questionContent = clean(answer.questionContent);
    let existingQuestion = questions.find(x => x.content === questionContent);
    let isNewQuestion = !existingQuestion;

    if (!existingQuestion) {
        existingQuestion = {content: questionContent, answers: []};
        questions.push(existingQuestion);
    }

    const currentAnswerForUser = existingQuestion.answers.find(x => isAnswerForUser(x, answer.userName, remoteIp));
    const answerContent = clean(answer.answerContent);

    if (answerContent === null && currentAnswerForUser) {
        deleteAnswer(currentAnswerForUser, existingQuestion);
    } else if (currentAnswerForUser) {
        currentAnswerForUser.content = answerContent;
    } else if (answerContent) {
        existingQuestion.answers.push({remoteIp, userName: answer.userName, content: answerContent});
    } else if (isNewQuestion) {
        deleteQuestion(existingQuestion);
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
