const responses = [];

const isUserResponse = (response, {userName, remoteIp}) => response.userName === userName && response.remoteIp === remoteIp;

const hasAnswer = ({answers}) => !answers.length || answers.some(Boolean);
const hasAnswers = response => {
    if (response.answers) {
        return hasAnswer(response);
    }

    return response.subResponses.some(hasAnswer);
};

const addQuestionResponse = (response, userData) => {
    const existingUserResponse = responses.find(x => x.content === response.content && isUserResponse(x, userData))
    
    if (existingUserResponse && !hasAnswers(response)) {
        responses.splice(responses.indexOf(existingUserResponse), 1);
    } else if (existingUserResponse) {
        existingUserResponse.answers = response.answers;

        if (response.subResponses) {
            existingUserResponse.subResponses = response.subResponses;
        }
    } else if (hasAnswers(response)) {
        responses.push({...response, ...userData});
    }
};

const getResponses = () => responses;

module.exports = {addQuestionResponse, getResponses};