const nameInput = document.getElementById('nameInput');
const serverInput = document.getElementById('serverInput');

const backgroundPage = chrome.extension.getBackgroundPage();

const registerSetting = (input, setting) => {
    input.addEventListener('change', () => {
        backgroundPage.setSetting(setting, input.value);
    });

    backgroundPage.getSetting(setting).then(value => {
        if (value) {
            input.value = value;
        }
    });
};

registerSetting(document.getElementById('nameInput'), 'name');
registerSetting(document.getElementById('serverInput'), 'server');