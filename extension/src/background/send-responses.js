const sendRequest = (serverAddress, userName, questionsResponses) => globalThis.getBaseAddress(serverAddress)
    .then(baseAddress => fetch(`${baseAddress}/response`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questionsResponses, userName })
    }));

globalThis.sendResponses = questionsResponses =>
    Promise.all([getSetting('server'), getSetting('name')])
        .then(([serverAddress, userName]) => sendRequest(serverAddress, userName, questionsResponses));