import Answer from '../Answer/Answer';

// TODO: Fix this elsewhere
const removeAnswerNumber = answerContent => answerContent.replace(/<span class="answernumber"[\w\s=_"]*>[\w\.\s]*<\/span>/g, '');

const getPossibleAnswers = question => {
    const answersFromResponse = question.responses.reduce((all, response) => {
        response.answers.forEach(x => {
            const content = removeAnswerNumber(x);

            all[content] = [...(all[content] || []), response];
        });
    
        return all;
    }, {});

    if (question.choices) {
        question.choices
            .map(removeAnswerNumber)
            .filter(x => !answersFromResponse.hasOwnProperty(x))
            .forEach(x => {
                answersFromResponse[x] = [];
            });
    }

    return answersFromResponse;
};

export default function Answers({ question }) {
    const answers = getPossibleAnswers(question);
    const bestAnswersResponsesCount = Math.max(...Object.values(answers).map(x => x.length));

    return (
        Object.keys(answers)
            .map(content => <Answer key={content}
                                    content={content}
                                    responses={answers[content]}
                                    isBest={answers[content].length === bestAnswersResponsesCount} />)
    );
};