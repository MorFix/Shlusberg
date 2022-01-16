try {
    importScripts('./src/background/database.js', './src/background/send-responses.js', './src/background/setup.js');
} catch (e) {
    console.error(e);
}