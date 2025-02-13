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


app.use(bodyParser.json()); //extrair as requisições HTTP

//fazer a listagem dos alunos 

app.get('/alunos', async(req,res)=>{        //função asincrona como callback 
    try{
        const result= await pool.query('SELECT * FROM alunos');     //o await faz a "captura" no banco de dados
        res.json(result.rows); //no final da consulta eu retorno um pacote json
    }catch(err){        //caso haja um erro na consulta
        console.error(err);
        {
            res.status(500).json({
                error:'erro em encontrar/listar os Alunos'
            });
        }
    }
});