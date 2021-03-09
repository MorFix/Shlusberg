globalThis.sendResponses = questionsResponses =>
    Promise.all([getSetting('server'), getSetting('name')])
        .then(([serverAddress, userName]) => fetch(serverAddress + '/response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questionsResponses, userName })
        }));