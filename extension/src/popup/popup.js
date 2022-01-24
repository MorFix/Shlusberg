const nameInput = document.getElementById('nameInput');
const serverInput = document.getElementById('serverInput');

const backgroundPage = chrome.extension.getBackgroundPage();
const POPUP_NAME = 'popup';

const registerSetting = (input, setting, callback) => {
    input.addEventListener('change', () => {
        backgroundPage.setSetting(setting, input.value);
        callback && callback(input);
    });

    backgroundPage.getSetting(setting).then(value => {
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

const onPageStateChanged = hasQuestions => {
    const warning = document.getElementById('warning');

    if (!hasQuestions) {
        warning.style.display = 'block';

        return;
    }

    warning.style.display = '';
};

chrome.tabs.query({active: true, currentWindow: true}, ([{id}]) => {    
    chrome.tabs.sendMessage(id, 'getPageQuestionsState', {}, onPageStateChanged);
});

const manifest = chrome.runtime.getManifest();
document.getElementById('version').innerHTML = `Version: ${manifest.version}`

const unsubscribe = backgroundPage.onPageStateChanged(onPageStateChanged)

const port = chrome.runtime.connect({name: POPUP_NAME});
port.onDisconnect.addListener(unsubscribe);