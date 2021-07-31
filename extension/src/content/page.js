const form = [...document.forms].find(x => x.action.includes('processattempt.php'));
let hasQuestions = !!form;

chrome.runtime.sendMessage({ name: 'setPageQuestionsState', data: hasQuestions});

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