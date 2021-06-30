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

const processQuestionContent = node => {
    let promise = Promise.resolve();

    if (node.nodeType !== Node.TEXT_NODE) {
        node.removeAttribute('id');

        if (node.tagName === 'IMG') {
            promise = getImageBase64(node)
                .then(base64 => node.setAttribute('src', base64));
        }
    }
    
    return promise.then(() => Promise.all([...node.childNodes].map(processQuestionContent)));
};

const getQuestionContent = contentNode => {
    const content = contentNode.cloneNode(true);
    
    return processQuestionContent(content)
        .then(() => content.innerHTML || content.textContent);
};

const createChoices = (inputs, createChoice) => inputs.reduce((choices, choice, index) => ({...choices, ...createChoice(choice, index)}), {});

const parseMatchingQuestion = select => {
    const content = getQuestionContent(select.parentNode.previousElementSibling);
    const choices = createChoices([...select], x => ({[x.value]: x.innerHTML}));

    return new Question(null, content, choices);
};

const checkAllInputs = (uniqueInputs, inputType, inputTagName) => uniqueInputs
    .every(([{type, tagName}]) => inputType && (type === inputType) ||
                                  inputTagName && (tagName === inputTagName));

const isMultiplecChoicesQuestion = (id, uniqueInputs) => {
    const choicesQuestionRegex = new RegExp(`^${id}_choice\\d+$`);

    return uniqueInputs.every(([_, input]) => input && choicesQuestionRegex.test(input.name));
};

const isSingleChoiceQuestion = uniqueInputs => uniqueInputs.length === 1 && uniqueInputs[0].every(x => x.type === 'radio');

const isEssayQuestion = uniqueInputs => checkAllInputs(uniqueInputs, 'hidden', 'TEXTAREA');
const isMatchingQuestion = uniqueInputs => checkAllInputs(uniqueInputs, null, 'SELECT');

const isTextQuestion = uniqueInputs => uniqueInputs.length === 1 &&
    uniqueInputs[0].length === 1 &&
    uniqueInputs[0][0].type === 'text';

const getQuestionData = (id, uniqueInputs) => {
    if (isMultiplecChoicesQuestion(id, uniqueInputs)) {
        const checkboxes = uniqueInputs.map(([_, checkbox]) => checkbox);
        const createChoice = (x, i) => ({[`choice${i}`]: x.nextElementSibling.innerHTML});

        return Promise.resolve({choices: createChoices(checkboxes, createChoice)});
    }

    if (isSingleChoiceQuestion(uniqueInputs)) {
        return Promise.resolve({choices: createChoices(uniqueInputs[0], x => ({[x.value]: x.nextElementSibling.innerHTML}))});
    }

    if (isEssayQuestion(uniqueInputs) || isTextQuestion(uniqueInputs)) {
        return Promise.resolve({});
    }

    if (isMatchingQuestion(uniqueInputs)) {
        return Promise.all(uniqueInputs.map(([x]) => parseMatchingQuestion(x)))
            .then((subQuestions) => ({subQuestions}));
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
    
    // TODO: What to do when the content isn't wrapped with .qtext ? see embedded
    if (!contentNode) {
        return null;
    }

    return Promise.all([getQuestionContent(contentNode), getQuestionData(id, uniqueInputs)])
        .then((content, {choices, subQuestions}) => new Question(id, content, choices, subQuestions));
};