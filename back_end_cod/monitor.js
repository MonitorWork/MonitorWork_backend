import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt ';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Criar um professor com senha segura
app.post('/professores', async (req, res) => {
    const { name, age, email, universityId, subject, password } = req.body;

    if (!name || !email || !universityId || !subject || !password) {
        return res.status(400).json({ error: 'Nome, email, registro universitário, disciplina e senha são obrigatórios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const professor = await prisma.professor.create({
        data: {
            name,
            age: age ? String(age) : null,
            email,
            universityId,
            subject,
            password: hashedPassword,
        },
    });

    res.status(201).json({ message: 'Professor cadastrado com sucesso!' });
});

// Autenticação de professor (login)
app.post('/professores/login', async (req, res) => {
    const { email, password } = req.body;

    const professor = await prisma.professor.findUnique({
        where: { email },
    });

    if (!professor) {
        return res.status(404).json({ error: 'Professor não encontrado' });
    }

    const senhaCorreta = await bcrypt.compare(password, professor.password);

    if (!senhaCorreta) {
        return res.status(401).json({ error: 'Senha incorreta' });
    }

    res.status(200).json({ message: 'Login bem-sucedido!' });
});

// Listar todos os professores (sem mostrar senha)
app.get('/professores', async (req, res) => {
    const professores = await prisma.professor.findMany({
        select: {
            id: true,
            name: true,
            age: true,
            email: true,
            universityId: true,
            subject: true,
        },
    });
    res.status(200).json(professores);
});

// Atualizar dados de um professor por ID
app.put('/professores/:id', async (req, res) => {
    const { name, age, email, universityId, subject, password } = req.body;
    const { id } = req.params;

    try {
        let dataUpdate = {
            name,
            age: age ? String(age) : null,
            email,
            universityId,
            subject,
        };

        if (password) {
            dataUpdate.password = await bcrypt.hash(password, 10);
        }

        const professorAtualizado = await prisma.professor.update({
            where: { id },
            data: dataUpdate,
        });

        return res.status(200).json(professorAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar professor:', error);
        return res.status(500).json({ error: 'Erro interno ao atualizar professor' });
    }
});

// Deletar um professor por ID
app.delete('/professores/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.professor.delete({
            where: { id },
        });

        return res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar professor:', error);
        return res.status(500).json({ error: 'Erro interno ao deletar professor' });
    }
});

// Fechar conexão do Prisma ao encerrar o servidor
process.on('SIGINT', async () => {
    console.log('Desconectando Prisma...');
    await prisma.$disconnect();
    process.exit();
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
