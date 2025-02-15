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

//após fazer a verificação se o aluno esta no banco dados eu posso criar o cadastro desse aluno


app.post('/alunos',async(req,res)=>{
    const { nome, dataNascimento,email}=req.body;

    try{
        const result = await pool.query(
            'INSERT INTO alunos (nome, data_nascimento, email) VALUES ($1, $2, $3) RETURNING *',
            [nome, dataNascimento, email]
          );

          res.status(201).json(result.rows[0]);
    }catch(err){
        console.error(err);
        res.status(500).json({ error:'erro ao cadastrar Aluno' });
    }
});

//atualizar cadastro aluno

app.put('/alunos/:id',async(req,res)=>{
    const {id} =req.parametro;
    const {nome,dataNascimento,email }=req.body;
    try{
        const result = await pool.query(
            'UPDATE alunos SET nome= $1, data_nascimento = &2, email = &3 WHERE id =$4 RETURNING *',
            [nome,dataNascimento,email,id]
        );
        if(result.rows.lenght ===0){
            res.status(404).json({error:'Aluno não encontrado' });
        }else{
            res.json(result.rows[0]);
        }
    }catch(err){
        console.error(err);
        res.status(500).json({error:'erro ao atualizar aluno'});
    }
});