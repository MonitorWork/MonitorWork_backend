const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const indexRouter = require('./routes/index'); // Exemplo de rota inicial

const app = express();

// Middlewares básicos
app.use(logger('dev')); // Logs HTTP
app.use(express.json()); // Parser para JSON
app.use(cors()); // Permitir requisições de outros domínios

// Rotas
app.use('/api', indexRouter); // Prefixo "/api" para todas as rotas

// Tratamento de erros 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Tratamento de erros gerais
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;
