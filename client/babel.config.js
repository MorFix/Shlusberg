module.exports = function(api) {
    return {
        presets: [
            ['@babel/preset-env'],
            ['@babel/preset-react', {runtime: 'automatic'}]
        ],
        plugins: [!api.env('production') && 'react-refresh/babel'].filter(Boolean)
    };
};