import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura';

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

        console.log('Senha informada pelo usuário:', password);
        console.log('Senha salva no banco:', user.password);

        const senhaCorreta = await bcrypt.compare(password, user.password); 
        console.log('Resultado da comparação de senha:', senhaCorreta);

        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload do token
            SECRET_KEY, // Chave secreta
            { expiresIn: '1h' }
            // Token expira em 1 hora
        );
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

     res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        console.error('Erro ao autenticar login:', error);
        res.status(500).json({ error: 'Erro interno ao autenticar login' });
    }
});

const autenticarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Adiciona o usuário ao request
        next(); // Continua para a próxima função
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
};

app.get('/perfil', autenticarToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, age: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro interno ao buscar perfil' });
    }
});

// Atualizar um aluno
app.put('/alunos/:id', async (req, res) => {
    const { id } = req.params;
    const { email, nome, age, password } = req.body;

    try {
        let dataUpdate = {
            email,
            name: nome,
            age: age !== undefined && age !== null ? String(age) : null,
        };

        if (password) {
            dataUpdate.password = await bcrypt.hash(password, 10);
        }

        const alunoAtualizado = await prisma.user.update({
            where: { id },
            data: dataUpdate,
        });

        return res.status(200).json(alunoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        return res.status(500).json({ error: 'Erro interno ao atualizar aluno' });
    }
});

// Listar todos os alunos
app.get('/alunos', autenticarToken, async (req, res) => {
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
