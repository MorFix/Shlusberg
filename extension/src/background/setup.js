const messageHandlers = {};
chrome.runtime.onMessage.addListener(({ name, data }, sender) => {
    if (messageHandlers[name]) {
        messageHandlers[name](data, sender);
    }
});

const addMessageListener = (name, callback) => {
    messageHandlers[name] = callback;

    return () => {
        delete messageHandlers[name];
    };
};

const onPageStateChangedListeners = [];
const onPageStateChanged = (callback) => {
    onPageStateChangedListeners.push(callback);

    return () => {
        onPageStateChangedListeners.splice(onPageStateChangedListeners.indexOf(callback), 1);
    };
};

const setPageAction = ({ icon, title }, { tab: { id } }) => {
    const tab = { tabId: id };

    if (icon) {
        chrome.pageAction.setIcon({ ...tab, path: icon });
    }

    chrome.pageAction.setTitle({ ...tab, title });
};

// Handle a message which indicates on finding a questions in the page
onPageStateChanged((hasQuestions, sender) => {
    if (!hasQuestions) {
        setPageAction({ title: 'No questions found in this page' }, sender);

        return;
    }

    setPageAction({ title: 'Knowledge is active!', icon: '../images/icon-active-32x32.png' }, sender);
});

const setPageQuestionsState = (hasQuestions, sender) => {
    onPageStateChangedListeners.forEach(listener => {
        listener(hasQuestions, sender);
    });
};

addMessageListener('setPageQuestionsState', setPageQuestionsState);
addMessageListener('sendResponses', globalThis.sendResponses);

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
globalThis.onPageStateChanged = onPageStateChanged;