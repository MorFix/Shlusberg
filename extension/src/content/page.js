const form = [...document.forms].find(x => x.action.includes('processattempt.php'));
let hasQuestions = !!form;

chrome.runtime.sendMessage({ name: 'setPageQuestionsState', data: hasQuestions});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'getPageQuestionsState') {
        sendResponse(hasQuestions);
    }
});

const captureSubmitter = (targetForm, submitter) => {
    if (submitter) {
        const formDataHandler = formDataEvent => {
            formDataEvent.formData.set(submitter.name, submitter.value);
            targetForm.removeEventListener('formdata', formDataHandler);
        };

        targetForm.addEventListener('formdata', formDataHandler)
    }
};

const onSubmit = event => { 
    event.preventDefault();

    const target = event.target;
    const responsesPromise = getResponses(target);
    captureSubmitter(target, event.submitter)
    
    responsesPromise.then(responses => {
        chrome.runtime.sendMessage({ name: 'sendResponses', data: responses });
        target.submit();
    });
};

if (hasQuestions) {
    form.addEventListener('submit', onSubmit);
}