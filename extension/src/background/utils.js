const getAddress = addressStr => {
    try {
        const {origin} = new URL(addressStr);

        return Promise.resolve(origin)
    } catch (e) {
        return Promise.reject(e);
    }
};

globalThis.getBaseAddress = addressStr => {
    const strategies = [
        getAddress,
        x => getAddress(`http://${x}`)
    ]

    return strategies.reduce((promise, strategy) => promise.catch(() => strategy(addressStr)), Promise.reject());
};