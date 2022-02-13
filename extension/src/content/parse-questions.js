globalThis.EMPTY_SELECTION_VALUE = '-1';

class Question {
    constructor(id, content, choices, subQuestions = []) {
        this.id = id;
        this.content = content;
        this.subQuestions = subQuestions;

        if (choices && Object.keys(choices).length) {
            this.choices = choices;
        }
    }
}

const getUrl = str => {
    try {
        return new URL(str);
    } catch {
        // Ignore and handle later on the flow
    }
};

const getImageBase64 = img => {
    const url = getUrl(img.src);

    // probably a base64 encoded source
    if (!url) {
        return Promise.resolve(img.src);
    }

    // probably a url that is CORS-wise accessible from the current page
    return fetch(img.src)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }))
        .catch(() => img.src);
};

const replaceImagesWithBase64 = node => {
    if (node.tagName === 'IMG') {
        return getImageBase64(node).then(base64 => node.setAttribute('src', base64));
    }

    return Promise.resolve();
};

const processQuestionContent = node => {    
    if (node.removeAttribute) {
        // To prevent uniqness false negative
        node.removeAttribute('id');
    }

    if (node.querySelectorAll) {
        // To remove controls inside the question content
        [...node.querySelectorAll('.control')].forEach(x => {
            x.parentNode.replaceChild(document.createTextNode('[?]'), x);
        });
    }

    return replaceImagesWithBase64(node)
        .then(() => Promise.all([...node.childNodes].map(processQuestionContent)));
};

const processChoiceContent = node => {
    if (node.removeAttribute) {
        // To prevent uniqness false negative
        node.removeAttribute('id');
    }
    
    return replaceImagesWithBase64(node)
        .then(() => Promise.all([...node.childNodes].map(processChoiceContent)));
};

const getContent = (contentNode, processContent) => {
    const content = contentNode.cloneNode(true);
    
    return processContent(content)
        .then(() => content.innerHTML || content.textContent);
};

const createChoices = (inputs, createChoice) => Promise.all(inputs.map(createChoice))
    .then(result => result.reduce((choices, choice) => ({...choices, ...choice}), {}))

const parseMatchingQuestion = select => Promise.all([
        getContent(select.parentNode.previousSibling, processQuestionContent),
        createChoices([...select], x => ({[x.value]: x.innerHTML}))
    ])
    .then(([content, choices]) => new Question(select.name, content, choices))

const checkAllInputs = (uniqueInputs, inputType, inputTagName) => uniqueInputs
    .every(([{type, tagName}]) => inputType && (type === inputType) ||
                                  inputTagName && (tagName === inputTagName));

const isMultiplecChoicesQuestion = (id, uniqueInputs) => {
    const choicesQuestionRegex = new RegExp(`^${id}_choice\\d+$`);

    return uniqueInputs.every(([_, input]) => input && choicesQuestionRegex.test(input.name));
};

const isSingleChoiceQuestion = uniqueInputs => uniqueInputs.length === 1 && uniqueInputs[0].every(x => x.type === 'radio');
const isEssayQuestion = uniqueInputs => checkAllInputs(uniqueInputs, 'hidden', 'TEXTAREA');
const isSelectBoxesQuestion = uniqueInputs => checkAllInputs(uniqueInputs, null, 'SELECT');

const isTextQuestion = uniqueInputs => uniqueInputs.length === 1 &&
    uniqueInputs[0].length === 1 &&
    uniqueInputs[0][0].type === 'text';

const getQuestionData = (id, uniqueInputs) => {
    // Checkbox choices
    if (isMultiplecChoicesQuestion(id, uniqueInputs)) {
        const checkboxes = uniqueInputs.map(([_, checkbox]) => checkbox);
        const createChoice = (x, i) => getContent(x.nextElementSibling, processChoiceContent)
            .then(content => ({[`choice${i}`]: content}))

        return createChoices(checkboxes, createChoice).then(choices => ({choices}));
    }

    // Radio choices
    if (isSingleChoiceQuestion(uniqueInputs)) {
        const radioInputs = uniqueInputs[0].filter(x => x.value !== globalThis.EMPTY_SELECTION_VALUE)
        const createChoice = x => getContent(x.nextElementSibling, processChoiceContent)
            .then(content => ({[x.value]: content}))

        return createChoices(radioInputs, createChoice).then(choices => ({choices}));
    }

    // Text questions
    if (isEssayQuestion(uniqueInputs) || isTextQuestion(uniqueInputs)) {
        return Promise.resolve({});
    }

    // Select box (or boxes)
    if (isSelectBoxesQuestion(uniqueInputs)) {
        return Promise.all(uniqueInputs.map(([x]) => parseMatchingQuestion(x))).then(subQuestions => ({subQuestions}));
    }

    // TODO: Add c, p
};

const getInputs = (id, container) => {
    const inputNameRegex = new RegExp(`^${id}_\\w+$`);
    const groupedByName = [...container.querySelectorAll('input, select, textarea')]
        .filter(({name}) => inputNameRegex.test(name))
        .reduce((all, input) => ({...all, [input.name]: [...(all[input.name] || []), input]}), {});

    return Object.values(groupedByName);
};

globalThis.parseQuestion = (id, form) => {
    const containerId = id.replace(':', '-').replace('q', 'question-');
    const questionContainer = form.querySelector(`#${containerId}`);
    if (!questionContainer) {
        return null;
    }

    // Get an array of index => inputs where every index is ALL inputs with a specific name
    const uniqueInputs = getInputs(id, questionContainer);
    if (!uniqueInputs.length) {
        return null;
    }

    const [contentNode] = questionContainer.getElementsByClassName('qtext');
    const questionDataPromise = getQuestionData(id, uniqueInputs)
    
    // TODO: What to do when the content isn't wrapped with .qtext ? see embedded
    if (!contentNode || !questionDataPromise) {
        return null;
    }

    return Promise.all([getContent(contentNode, processQuestionContent), questionDataPromise])
        .then(([content, {choices, subQuestions}]) => new Question(id, content, choices, subQuestions));
};