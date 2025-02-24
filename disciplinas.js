import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());


app.post('/disciplinas', async (req, res) => {
    
    const { name, professorId } = req.body;

    if (!name || !professorId) {
        return res.status(400).json({ error: 'Nome da disciplina e ID do professor são obrigatórios' });
    }


     const professor = await prisma.professor.findUnique({
        where: { id: professorId }
    });

    if (!professor) {
        return res.status(404).json({ error: 'Professor não encontrado' });
    }
});