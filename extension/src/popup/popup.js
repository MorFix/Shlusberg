const nameInput = document.getElementById('nameInput');
const serverInput = document.getElementById('serverInput');

const POPUP_NAME = 'popup';
const SET_HAS_QUESTIONS_EVENT_NAME = 'setPageQuestionsState';

const port = chrome.runtime.connect({name: POPUP_NAME});
const registerSetting = (input, setting, callback) => {
    input.addEventListener('change', () => {
        port.postMessage({ name: 'setSetting', data: {setting, value: input.value} });
        callback && callback(input);
    });

    port.postMessage({ name: 'getSetting', data: {setting} }, value => {
        if (value) {
            input.value = value;
            callback && callback(input);
        }
    });
};

const onServerChange = input => {  
    document.getElementById('serverLink').href = input.value || '#';
};

registerSetting(document.getElementById('nameInput'), 'name');
registerSetting(document.getElementById('serverInput'), 'server', onServerChange);

const setHasQuestionsAlert = hasQuestions => {
    const warning = document.getElementById('warning');

    if (!hasQuestions) {
        warning.style.display = 'block';

        return;
    }

    warning.style.display = '';
};

// Query the page for to decide whether we have questions
chrome.tabs.query({active: true, currentWindow: true}, ([{id}]) => {
    chrome.tabs.sendMessage(id, 'getPageQuestionsState', {}, setHasQuestionsAlert);
});

chrome.runtime.onMessage.addListener(({ name, data: hasQuestions }) => {
    if (name === SET_HAS_QUESTIONS_EVENT_NAME) {
        setHasQuestionsAlert(hasQuestions);
    }
});

// chrome.runtime.sendMessage({ name: 'setPageStateChangedListener', data: onAfterQuestionsSearch }, () => {
//     const port = chrome.runtime.connect({name: POPUP_NAME});
//     port.onDisconnect.addListener(() => {
//         chrome.runtime.sendMessage({ name: 'removePageStateChangedListener' })
//     });
// });