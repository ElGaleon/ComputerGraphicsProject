const path = require('path');

module.exports = {
  entry: {
    app: './src/app.js',
  },
  mode: "development",
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './src/bundle.js',
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
