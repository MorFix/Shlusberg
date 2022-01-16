const SET_HAS_QUESTIONS_EVENT_NAME = 'setPageQuestionsState';

const messageHandlers = {};
chrome.runtime.onMessage.addListener(({ name, data }, sender, sendResponse) => {
    if (messageHandlers[name]) {
        const result = messageHandlers[name](data, sender);
        if (result !== undefined) {
            result.then ? result.then(r => sendResponse(r)) : sendResponse(result)
        }
    }
});

const addMessageListener = (name, callback) => {
    messageHandlers[name] = callback;

    return () => {
        delete messageHandlers[name];
    };
};

const setPageAction = ({ icon, title }, { tab: { id } }) => {
    const tab = { tabId: id };

    if (icon) {
        chrome.action.setIcon({ ...tab, path: icon });
    }

    chrome.action.setTitle({ ...tab, title });
};

// Handle a message which indicates on finding a questions in the page
const setHasQuestionsIcon = (hasQuestions, sender) => {
    if (!hasQuestions) {
        setPageAction({ title: 'No questions found in this page' }, sender);

        return;
    }

    setPageAction({ title: 'Knowledge is active!', icon: '../images/icon-active-32x32.png' }, sender);
};

addMessageListener(SET_HAS_QUESTIONS_EVENT_NAME, setHasQuestionsIcon);
addMessageListener('sendResponses', globalThis.sendResponses);
addMessageListener('setSetting', ({setting, value}) => globalThis.setSetting(setting, value))
addMessageListener('getSetting', ({setting}) => globalThis.getSetting(setting))

// Add default settings & make the extension always available
chrome.runtime.onInstalled.addListener(() => {
    const DEFAULT_SERVER_ADDRESS = 'http://3.22.242.110';
    const SETTING_SERVER = 'server';

    globalThis.getSetting(SETTING_SERVER)
        .then(server => !server ? globalThis.setSetting(SETTING_SERVER, DEFAULT_SERVER_ADDRESS) : Promise.resolve());

    const defaultRule = {
        conditions: [new chrome.declarativeContent.PageStateMatcher()],
        actions: [new chrome.declarativeContent.ShowPageAction()]
    };

    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([defaultRule]);
    });
});

chrome.runtime.onConnect.addListener(() => {});