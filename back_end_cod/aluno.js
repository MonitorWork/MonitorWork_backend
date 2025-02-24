import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Criar um novo aluno no banco de dados
app.post('/alunos', async (req, res) => {
    try {
        const { email, nome, age, password } = req.body;

        if (!email || !nome || !password) {
            return res.status(400).json({ error: 'Email, nome e senha são obrigatórios' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const novoAluno = await prisma.user.create({
            data: {
                email,
                name: nome,
                age: age ? String(age) : null,
                password: hashedPassword,
            },
        });

        res.status(201).json(novoAluno);
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        res.status(500).json({ error: 'Erro interno ao criar aluno' });
    }
});

// Autenticação de login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const senhaCorreta = await bcrypt.compare(password, user.password);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        res.status(200).json({ message: 'Login bem-sucedido!' });
    } catch (error) {
        console.error('Erro ao autenticar login:', error);
        res.status(500).json({ error: 'Erro interno ao autenticar login' });
    }
});

// Atualizar um aluno
app.put('/alunos/:id', async (req, res) => {
    try {
        const { email, nome, age, password } = req.body;
        const { id } = req.params;

        let dataUpdate = {
            email,
            name: nome,
            age: age ? String(age) : null,
        };

        if (password) {
            dataUpdate.password = await bcrypt.hash(password, 10);
        }

        const alunoAtualizado = await prisma.user.update({
            where: { id },
            data: dataUpdate,
        });

        res.status(200).json(alunoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar aluno' });
    }
});

// Listar todos os alunos
app.get('/alunos', async (req, res) => {
    try {
        const alunos = await prisma.user.findMany();
        res.status(200).json(alunos);
    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({ error: 'Erro interno ao buscar alunos' });
    }
});

// Deletar um aluno
app.delete('/alunos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.user.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar aluno:', error);
        res.status(500).json({ error: 'Erro interno ao deletar aluno' });
    }
});

// Fechar conexão do Prisma ao encerrar o servidor
process.on('SIGINT', async () => {
    console.log('Desconectando Prisma...');
    await prisma.$disconnect();
    process.exit();
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
