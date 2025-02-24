import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const app = express();
app.use(express.json());


pp.post('/alunos', async (req, res)) //criar o campo que comunica com o banco

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});