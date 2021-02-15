(() => {
    const DATABASE_NAME = 'shlusberg-db';
    const DATABASE_VERSION = 1;
    const DEFAULT_SERVER_ADDRESS = 'http://3.22.242.110';

    const SETTINGS_STORE_NAME = 'settings';

    const promisify = (dbRequest, successEvent = 'onsuccess') => {
        const promise = new Promise((resolve, reject) => {
            dbRequest[successEvent] = (...args) => resolve.apply(promise, args);
            dbRequest.onerror = (...args) => reject.apply(promise, args);
        });

        return promise;
    };

    const onDbUpgradeNeeded = event => {
        const upgradeDb = event.target.result;

        if (!upgradeDb.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
            upgradeDb.createObjectStore(SETTINGS_STORE_NAME, {keyPath: 'key'});
        }

        window.setSetting('server', DEFAULT_SERVER_ADDRESS);
    };

    const getDatabase = () => {
        if (!('indexedDB' in window)) {
            console.log('This browser doesn\'t support IndexedDB');
            
            return;
        }

        const dbRequest = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        dbRequest.onupgradeneeded = onDbUpgradeNeeded;

        return promisify(dbRequest)
            .then(() => {
                database = dbRequest.result;
                
                return database;
            });
    }

    const getTransaction = (db, store) => db.transaction(store, 'readwrite');

    const queryOne = (storeName, key) => getDatabase()
        .then(db => {
            const request = getTransaction(db, storeName)
                .objectStore(storeName)
                .get(key);

            return promisify(request);
        })
        .then(event => event.target.result);

    const putOne = (storeName, value) => getDatabase()
        .then(db => {
            const transaction = getTransaction(db, storeName);
            const store = transaction.objectStore(storeName);
            
            const putRequest = promisify(store.put(value));

            return Promise.all([putRequest, promisify(transaction, 'oncomplete')]);
        });

    window.setSetting = (key, value) => putOne(SETTINGS_STORE_NAME, {key, value});
    window.getSetting = key => queryOne(SETTINGS_STORE_NAME, key)
        .then(res => res && res.value);
})();