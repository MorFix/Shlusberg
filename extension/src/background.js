const quizUrl = 'moodle.colman.ac.il/mod/quiz';
let currentQuestion;

const questionMessageHandler = question => {
    currentQuestion = question;
}

const messageHandlers = {
    question: questionMessageHandler
};

const sendAnswer = (questionContent, answerContent) => {
    Promise.all([getSetting('server'), getSetting('name')])
        .then(([serverAddress, userName]) => fetch(serverAddress + '/answer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({questionContent, answerContent, userName})
          }));
};

const findSelectedAnswer = (question, formData) => {
    const answerNumberKey = Object.keys(formData).find(x => x.endsWith('_answer'));
    const [answerNumber] = formData[answerNumberKey]; 

    if (answerNumber == null || answerNumber === '-1') {
        return;
    }

    return question.answers[answerNumber];
};

chrome.runtime.onMessage.addListener(function(message) {
    if (messageHandlers[message.name]) {
        messageHandlers[message.name](message.data);
    }
});

// Handle requests for the questions processing page
chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if (!currentQuestion) {
        return;
    }
    
    const formData = details.requestBody && details.requestBody.formData;
    if (!formData) {
        return;
    }

    const selectedAnswer = findSelectedAnswer(currentQuestion, formData);
    if (selectedAnswer) {
        sendAnswer(currentQuestion.content, selectedAnswer.content);
    }
 
}, {urls: ["https://" + quizUrl + "/processattempt.php*"]}, ["requestBody"]);

// Grayscale the extension when necessary
chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { urlContains: quizUrl },
                    })
                ],
                actions: [ new chrome.declarativeContent.ShowPageAction() ]
            }
        ]);
    });
});