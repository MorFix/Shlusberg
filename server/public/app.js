const groupAnswersByContent = answers => answers.reduce((all, answer) => {
    all[answer.content] = all[answer.content] || [];
    all[answer.content].push(answer);

    return all;
}, {});

const isBestAnswer = (answerContent, allAnswers) => {
    const answersByContent = groupAnswersByContent(allAnswers);
    let bestAnswerCount = 0;
    
    for (let key in answersByContent) {
        if (answersByContent[key].length > bestAnswerCount) {
            bestAnswerCount = answersByContent[key].length;
        }
    }

    return answersByContent[answerContent].length === bestAnswerCount;
};

const renderStats = (answerContent, allAnswers) => groupAnswersByContent(allAnswers)[answerContent]
    .map(x => x.userName)
    .join(', ')

const renderAnswer = (answerContent, question) => {
    const answerElem = document.createElement('div');
    answerElem.style.margin = '5px';

    const answerContentElem = document.createElement('span');
    answerContentElem.innerHTML = answerContent;
    answerContentElem.style.display = 'block';
    if (isBestAnswer(answerContent, question.answers)) {
        answerContentElem.style.fontWeight = 'bold';
        answerContentElem.style.color = 'green';
    }

    const answerStatsElem = document.createElement('span');
    answerStatsElem.innerHTML = '(' + renderStats(answerContent, question.answers) + ')'
    answerStatsElem.style.display = 'block';

    answerElem.appendChild(answerContentElem)
    answerElem.appendChild(answerStatsElem);

    return answerElem; 
};

const renderQuestion = question => {
    const questionElem = document.createElement('div');
    
    const questionTitle = document.createElement('h1');
    questionTitle.innerHTML = decodeURIComponent(question.content);

    questionElem.appendChild(questionTitle);

    for (let content in groupAnswersByContent(question.answers)) {
        questionElem.appendChild(renderAnswer(content, question));
    }

    const hr = document.createElement('hr');
    questionElem.appendChild(hr);

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
    fetch('/answers')
        .then(res => res.json())
        .then(renderQuestions);
};

setInterval(init, 2000);