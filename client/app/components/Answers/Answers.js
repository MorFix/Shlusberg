import Answer from '../Answer/Answer';

const getPossibleAnswers = question => {
    const answersFromResponse = question.responses.reduce((all, response) => {
        response.answers.forEach(x => {
            all[x] = [...(all[x] || []), response];
        });
    
        return all;
    }, {});

    if (question.choices) {
        question.choices
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