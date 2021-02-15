const inject = () => {
    const cleanIdAttribute = node => {
        node.removeAttribute('id');
        Array.from(node.children).forEach(cleanIdAttribute);
    };

    const parseAnswer = (all, elem) => {
        const input = elem.querySelector('input');

        all[input.value] = {
            content: elem.querySelector('div').innerText 
        };

        return all;
    };
    
    const parseQuestion = () => {
        const [content] = document.getElementsByClassName('qtext')
        const [answersContainer] = document.getElementsByClassName('answer');
        
        if (!content || !answersContainer) {
            return null;
        }

        const contentClone = content.cloneNode(true);
        cleanIdAttribute(contentClone);

        return {
            content: contentClone.innerHTML,
            answers: Array.from(answersContainer.children).reduce(parseAnswer, {})
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
