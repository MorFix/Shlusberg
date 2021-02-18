const inject = () => {
    const getImageBase64 = img => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        
        return canvas.toDataURL("image/png");
    };

    const sanitiazeElements = node => {
        node.removeAttribute('id');
        
        if (node.tagName === 'IMG') {
            node.setAttribute('src', getImageBase64(node));
        }

        Array.from(node.children).forEach(sanitiazeElements)
    };

    const parseAnswer = (all, elem) => {
        const input = elem.querySelector('input');

        all[input.value] = {
            content: elem.querySelector('label').innerText 
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
        sanitiazeElements(contentClone);

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
