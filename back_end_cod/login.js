const express = require('express');
const {pool}=require ('pg');
const bodyParser= require('body-parser');

const app =express;
const port=3000;

// cadastrar um novo usuario

const pool = new pool ({
    user: 'nome_usuario',
    host: 'localhost',
    database: 'Aluno_cadastro',
    password : 'sua_senha',
    port :5432 , //porta padrão do postgreSQL
});


