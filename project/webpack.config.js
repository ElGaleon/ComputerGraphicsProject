const path = require('path');

module.exports = {
  entry: {
    app: './js/app.js',
  },
  mode: "development",
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Processa tutti i file .js
        exclude: /node_modules/,
        use: 'babel-loader', // Usa Babel per compatibilità
      },
    ],
  },
  resolve : {
    extensions: ['.js', '.json'],
  },
};
