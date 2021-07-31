const indexBasedAnswerKeys = ['sub', 'c', 'p'];
const getLast = arr => arr.slice(-1)[0];

const splitResponseField = fullName => {
    const underscoreIndex = fullName.indexOf('_');

    return [fullName.substr(0, underscoreIndex), fullName.substr(underscoreIndex + 1)];
};

const groupResponseDataByQuestion = formData => [...formData.entries()]
    .filter(([name]) => /q\d+:\d+_\w+/.test(name))
    .reduce((all, [fullName, value]) => {
        const [questionId, name] = splitResponseField(fullName);

        all[questionId] = all[questionId] || {};
        all[questionId][name] = [...(all[questionId][name] || []), value];

        return all;
    }, {});

const getTextualAnswer = (choices, selectedChoiceKey) => selectedChoiceKey !== '-1' ? choices[selectedChoiceKey] : null; 

const getSubResponse = (subQuestion, parentResponseData, index) => {
    const subResponseData = Object.keys(parentResponseData)
        .filter(x => new RegExp(`^(${indexBasedAnswerKeys.join('|')})${index}`).test(x))
        .reduce((all, key) => {
            const [newKey, rest] = splitResponseField(key);
    
            return {...all, [rest || newKey]: parentResponseData[key]}
        }, {});

    return getResponse(subQuestion, subResponseData, index);
};

const getSubResponses = (subQuestions, parentResponseData) =>
    subQuestions.map((x, index) => getSubResponse(x, parentResponseData, index));

const getAnswers = (choices, responseData, index) => {
    if (responseData.hasOwnProperty('answer')) {
        const answer = getLast(responseData.answer); 
        
        return [choices ? getTextualAnswer(choices, answer) : answer]; 
    }

    const responseDataFields = Object.keys(responseData);
    if (responseDataFields.every(x => x.startsWith('choice'))) {
        return responseDataFields
            .filter(x => getLast(responseData[x]) === '1') // Get all checked answers
            .map(x => getTextualAnswer(choices, x));
    }

    const answerKey = indexBasedAnswerKeys.find(x => responseData.hasOwnProperty(`${x}${index}`));
    if (choices && answerKey) {
        const choiceKey = getLast(responseData[`${answerKey}${index}`]);

        return [getTextualAnswer(choices, choiceKey)];
    }

    // TODO: Take care of radio using getTextualAnswers
};

const getResponse = ({content, choices, subQuestions}, responseData, index = null) => ({
    content,
    answers: getAnswers(choices, responseData, index),
    ...(subQuestions.length ? {subResponses: getSubResponses(subQuestions, responseData)} : {}),
    ...(choices ? {choices: Object.values(choices)} : {})
});

globalThis.getResponses = form => {
    const questionsResponsesData = groupResponseDataByQuestion(new FormData(form));

    return Promise.all(Object.keys(questionsResponsesData)
        .map(x => globalThis.parseQuestion(x, form)))
        .then(result => result.filter(Boolean).map(question => getResponse(question, questionsResponsesData[question.id])));
};