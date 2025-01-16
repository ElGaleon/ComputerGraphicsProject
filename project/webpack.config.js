const path = require('path');

module.exports = {
  entry: {
    app: './js/app.js',
  },
  mode: "development",
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/app.js',
  },
  resolve : {
    extensions: ['.js', '.json'],
  },
};
