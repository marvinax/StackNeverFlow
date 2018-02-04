var webpack = require('webpack')

module.exports = {
    entry: "./client/Foundry.js",
    output: {
        path: __dirname + '/public/scripts/',
        filename: "main.js"
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: 'style-loader!css-loader'}
        ]
    }
};
