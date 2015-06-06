var path = require('path')

module.exports = {
    entry: "./client/main.jsx",
    output: {
        path: path.join(__dirname, 'public/scripts/'),
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.jsx?$/, loader: "jsx-loader?harmony?insertPragma=React.DOM"}
        ]
    }
};
