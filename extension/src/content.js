const inject = () => {
    const parseQuestion = () => {
        return {
            content: 'How much is 5 + 3 ?',
            answers: {
                0: {content: '8'},
                1: {content: '7'},
                2: {content: '6'},
                3: {content: '5'},
            }
        }
    };
    
    const question = parseQuestion();
    if (!question) {
        console.warn('Cannot find any questions in the current page');

        return;
    }

    chrome.runtime.sendMessage({ name: 'question', data: question });    
};

inject();
