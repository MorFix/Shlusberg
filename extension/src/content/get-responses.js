const CHECKBOX_CHECKED_VALUE = '1';

const indexBasedAnswerKeys = ['sub', 'c', 'p'];
const getLast = arr => arr.slice(-1)[0];

const splitResponseField = fullName => {
    const underscoreIndex = fullName.indexOf('_');

    return [fullName.substr(0, underscoreIndex), fullName.substr(underscoreIndex + 1)];
};

// A question may have multiple inputs, which means it has sub-questions (unless the inputs are of type 'choice' - checkboxes)
const groupResponseDataByQuestion = formData => [...formData.entries()]
    .filter(([questionInputName]) => /q\d+:\d+_\w+/.test(questionInputName))
    .reduce((all, [questionInputName, questionInputValue]) => {
        // A question input name may be one of:
        // {QUESTION_ID}_answer
        // {QUESTION_ID}_{INPUT}_{INPUT}...
        // {QUESTION_ID}_{INPUT}_{INPUT}_answer
        // Where {INPUT} = (sub|c|p|choice){INDEX} and {INDEX} = 0 or 1 based index of the question.
        const [questionId] = splitResponseField(questionInputName);

        all[questionId] = all[questionId] || {};
        all[questionId][questionInputName] = [...(all[questionId][questionInputName] || []), questionInputValue];

        /*
        Example output object:
            q64 -> {q64_answer: 'myAnswer'},
            q65 -> {q65_c1: 0, q65_c2: 0, q65_c3: 4},
            q66 -> {q66_p1_sub0: 0, q66_p1_sub1: 1, q66_p2_answer: 'myAnswer2'}
        */
        return all;
    }, {});

const getTextualAnswer = (choices, selectedChoiceKey) => selectedChoiceKey !== globalThis.EMPTY_SELECTION_VALUE ? choices[selectedChoiceKey] : null; 

const getSubResponses = (subQuestions, parentResponseUserData) =>
    subQuestions.map(subQuestion => {
        const subResponseUserData = Object.keys(parentResponseUserData)
            .filter(x => x.startsWith(subQuestion.id))
            .reduce((all, key) => ({...all, [key]: parentResponseUserData[key]}), {});

        return getResponse(subQuestion, subResponseUserData);
    });

const getUserAnswers = (questionId, choices, userResponseData) => {
    // 'answer' field may appear on either radio question or a textual question
    const answerKey = `${questionId}_answer`
    if (userResponseData.hasOwnProperty(answerKey)) {
        const answer = getLast(userResponseData[answerKey]); 
        
        return [choices ? getTextualAnswer(choices, answer) : answer]; 
    }

    // When 'choice' fields appear in responseData it's probably a checkboxes question
    const responseDataFields = Object.keys(userResponseData);
    if (responseDataFields.every(x => x.startsWith(`${questionId}_choice`))) {
        return responseDataFields
            .filter(x => getLast(userResponseData[x]) === CHECKBOX_CHECKED_VALUE) // Get all checked answers
            .map(x => getTextualAnswer(choices, x));
    }

    if (choices) {
        const choiceKey = getLast(userResponseData[questionId]);

        return [getTextualAnswer(choices, choiceKey)];
    }

    // TODO: Take care of radio using getTextualAnswers
};

const getResponse = ({id, content, choices, subQuestions}, userResponsesData) => ({
    content,
    answers: getUserAnswers(id, choices, userResponsesData),
    ...(subQuestions.length ? {subResponses: getSubResponses(subQuestions, userResponsesData)} : {}),
    ...(choices ? {choices: Object.values(choices)} : {})
});

globalThis.getResponses = form => {
    const userResponsesData = groupResponseDataByQuestion(new FormData(form));
    const questionsPromises = Object.keys(userResponsesData).map(x => globalThis.parseQuestion(x, form))

    return Promise.all(questionsPromises)
        .then(questions => questions.filter(Boolean)
                                    .map(question => getResponse(question, userResponsesData[question.id])));
};