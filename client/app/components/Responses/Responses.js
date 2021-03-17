import Box from '@material-ui/core/Box';

import Question from '../Question/Question';

const createQuestion = ({ content, choices, subResponses }) => {
    const question = { content };

    if (choices) {
        question.choices = choices;
    }

    if (subResponses) {
        question.subQuestions = subResponses.map(createQuestion);
    }

    return question;
};

const getSubQuestionsWithResponses = (parentResponses) => {
    const responses = parentResponses.flatMap(({ subResponses, user }) => subResponses.map(y => ({ ...y, user })));

    return getQuestionsWithResponses(responses);
};

const createResponse = ({answers, user, subResponses}) => ({...(answers ? {answers} : {}), ...(subResponses ? {subResponses} : {}), user});
const groupByContent = (all, response) => {
    const question = all[response.content] = (all[response.content] || { question: createQuestion(response), responses: [] });
    question.responses = [...question.responses, createResponse(response)];

    return all;
};

const getQuestionsWithResponses = responses => Object.values(responses.reduce(groupByContent, {}))
    .map(({ question: { content, choices, subQuestions }, responses }) => ({
        content,
        ...(choices ? { choices } : {}),
        ...(subQuestions ? { subQuestions: getSubQuestionsWithResponses(responses) } : {responses})
    }));

export default function Responses({ responses }) {
    return (
        <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            {
                getQuestionsWithResponses(responses)
                    .map(x => (
                        <Box key={x.content}>
                            <Question question={x} />
                        </Box>
                    ))
            }
        </Box>
    );
};