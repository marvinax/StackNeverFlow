const path = require('path');

module.exports = {
    entry: "./client/Foundry.js",
    output: {
        path: __dirname + '/public/scripts/',
        filename: "main.js"
    },
    module: {
        loaders: [
            {test: /\.css$/,  use: [ 'style-loader', 'css-loader' ]},
            {
              loader: "babel-loader",

              // Skip any files outside of your project's `src` directory
              include: [
                path.resolve(__dirname, "src"),
              ],

              // Only run `.js` and `.jsx` files through Babel
              test: /\.jsx?$/,

              // Options to configure babel with
              query: {
                plugins: ['transform-runtime'],
                presets: ['es2015', 'stage-0', 'react'],
              }
            }
        ]
    }
};
