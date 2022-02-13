const responses = [];

const isUserResponse = (response, user) => response.user.name === user.name // && response.user.remoteIp === user.remoteIp; // TODO: handle load balancer

const hasAnswer = ({answers}) => !answers.length || answers.some(Boolean);
const hasAnswers = response => {
    if (response.answers) {
        return hasAnswer(response);
    }

    return response.subResponses.some(hasAnswer);
};

const addQuestionResponse = (response, user) => {
    const existingUserResponse = responses.find(x => x.content === response.content && isUserResponse(x, user))
    
    if (existingUserResponse && !hasAnswers(response)) {
        responses.splice(responses.indexOf(existingUserResponse), 1);
    } else if (existingUserResponse) {
        existingUserResponse.answers = response.answers;

        if (response.subResponses) {
            existingUserResponse.subResponses = response.subResponses;
        }
    } else if (hasAnswers(response)) {
        responses.push({...response, user});
    }
};

const getResponses = () => responses;

module.exports = {addQuestionResponse, getResponses};