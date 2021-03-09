const groupResponsesByAnswer = responses => responses.reduce((answersToResponses, response) => {
    answersToResponses[response.answerContent] = answersToResponses[response.answerContent] || [];
    answersToResponses[response.answerContent].push(response);

    return answersToResponses;
}, {});

const renderAnswerContent = (content, isBest) => {
    const elem = document.createElement('span');
    
    elem.innerHTML = content;
    elem.style.display = 'block';
    
    if (isBest) {
        elem.style.fontWeight = 'bold';
        elem.style.color = 'green';
    }

    return elem;
};

const renderAnswerStats = responses => {
    const elem = document.createElement('span');
    
    elem.innerHTML = '(' + responses.map(x => x.userName).join(', ') + ')';
    elem.style.display = 'block';

    return elem;
};

const renderAnswer = (content, responses, isBest) => {
    const answerElem = document.createElement('div');
    answerElem.style.margin = '5px';

    answerElem.appendChild(renderAnswerContent(content, isBest));
    answerElem.appendChild(renderAnswerStats(responses));

    return answerElem; 
};

const renderAnswers = responses => {
    const answers = groupResponsesByAnswer(responses);
    const bestAnswersResponsesCount = Math.max(...Object.values(answers).map(x => x.length));

    return Object.keys(answers)
        .map(content => renderAnswer(content,
                                     answers[content],
                                     answers[content].length === bestAnswersResponsesCount));
};

const renderQuestion = ({content, responses}) => {
    const questionElem = document.createElement('div');
    
    const questionContent = document.createElement('h3');
    questionContent.innerHTML = content;

    questionElem.appendChild(questionContent);

    renderAnswers(responses).forEach(x => {
        questionElem.appendChild(x);
    });

    questionElem.appendChild(document.createElement('hr'));

    return questionElem;
};

const renderQuestions = questions => {
    const container = document.getElementById('questions');
    container.innerHTML = '';

    questions.forEach(question => {
        container.appendChild(renderQuestion(question));
    });
};

const init = () => {
    fetch('/response')
        .then(res => res.json())
        .then(renderQuestions);
};

setInterval(init, 4000);
init();