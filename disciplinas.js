import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

/** Criar uma matéria vinculada a um professor */
app.post('/disciplinas', async (req, res) => {
    const { name, professorId } = req.body;

    if (!name || !professorId) {
        return res.status(400).json({ error: 'Nome da disciplina e ID do professor são obrigatórios' });
    }

    // Verificar se o professor existe
    const professor = await prisma.professor.findUnique({
        where: { id: professorId }
    });

    if (!professor) {
        return res.status(404).json({ error: 'Professor não encontrado' });
    }

    const disciplina = await prisma.discipline.create({
        data: {
            name,
            professorId
        },
        include: { professor: true } // Retorna os dados do professor junto com a disciplina
    });

    res.status(201).json(disciplina);
});

/** Listar todas as disciplinas com os dados dos professores */
app.get('/disciplinas', async (req, res) => {
    const disciplinas = await prisma.discipline.findMany({
        include: { professor: true }
    });

    res.status(200).json(disciplinas);
});

/** Atualizar uma disciplina */
app.put('/disciplinas/:id', async (req, res) => {
    const { id } = req.params;
    const { name, professorId } = req.body;

    try {
        const disciplinaAtualizada = await prisma.discipline.update({
            where: { id },
            data: { name, professorId },
            include: { professor: true }
        });

        res.status(200).json(disciplinaAtualizada);
    } catch (error) {
        console.error('Erro ao atualizar disciplina:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar disciplina' });
    }
});

/** Deletar uma disciplina */
app.delete('/disciplinas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.discipline.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar disciplina:', error);
        res.status(500).json({ error: 'Erro interno ao deletar disciplina' });
    }
});