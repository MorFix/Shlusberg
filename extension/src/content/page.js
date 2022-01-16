const form = [...document.forms].find(x => x.action.includes('processattempt.php'));
let hasQuestions = !!form;

const SET_HAS_QUESTIONS_EVENT_NAME = 'setPageQuestionsState';
chrome.runtime.sendMessage({ name: SET_HAS_QUESTIONS_EVENT_NAME, data: hasQuestions});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'getPageQuestionsState') {
        sendResponse(hasQuestions);
    }
});

const onSubmit = event => { 
    getResponses(event.target).then(responses => {
        chrome.runtime.sendMessage({ name: 'sendResponses', data: responses });
    });
};

if (hasQuestions) {
    form.addEventListener('submit', onSubmit);
}