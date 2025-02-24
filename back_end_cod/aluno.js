import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

//criar o campo que comunica com o banco
pp.post('/alunos', async (req, res) =>{
    const {email , nome ,age } =req.body;

    if(!email || !nome){
        
    }
}

) 

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});