import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

//criar o campo que comunica com o banco
pp.post('/alunos', async (req, res) =>{
    const {email , nome ,age } =req.body;

    if(!email || !nome){
        return res.status(400).json({ error: 'Email e nome são obrigatórios' });
    }
    const idade = age !== undefined && age !== null ? String(age) : null;

    const novoAluno = await prisma.user.create({
        data: {
            email,
            name: nome, 
            age: idade,  
        },
    });
    res.status(201).json(novoAluno);
}) ;


app.put('/alunos/:id',async(req,res)=>{
    const {email ,nome ,age} = req.body;
    const idade= age !== undefined && age !==null ? string (age):null
    try{
        const alunoAtualizado=await prisma.user.update({
            where:{
                id:req.params.id,
            },
            data: {
                email,
                name: nome,
                age: idade,
            },
        });
        res.status(200).json(alunoAtualizado);
    }catch(error){
        res.status(404).json({error:"aluno não encontrado"});
    }

});

//receber a listagem dos alunos
app.get('/alunos', async (req, res) => {
    const alunos = await prisma.user.findMany();
    res.status(200).json(alunos);
});

//delete
app.delete('/alunos/:id', async (req, res)=> {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: { id },
        });
        return res.status(204).send('usuario deletado com sucesso'); 

);
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});