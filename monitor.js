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

// Criar um novo professor no banco de dados
app.post('/professores', async (req, res) => {
    try {
        const { nome, age, telefone, universityId, disciplina, email, password } = req.body;

        // Validar se os campos obrigatórios foram fornecidos
        if (!nome || !email || !password || !universityId || !disciplina || !telefone) {
            return res.status(400).json({ error: 'Nome, email, senha, ID da universidade, disciplina e telefone são obrigatórios' });
        }

        // Verificar se já existe um professor com o mesmo e-mail ou telefone
        const professorExistente = await prisma.professor.findFirst({
            where: {
                OR: [
                    { email },
                    { telefone }
                ]
            }
        });

        if (professorExistente) {
            return res.status(400).json({ error: 'Já existe um professor com esse e-mail ou telefone' });
        }

        // Criptografar a senha do professor
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar o novo professor no banco de dados
        const novoProfessor = await prisma.professor.create({
            data: {
                name: nome,
                age: age ? String(age) : null, // Convertendo a idade para string (caso fornecido)
                telefone,
                universityId,
                subject: disciplina,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json(novoProfessor);
    } catch (error) {
        console.error('Erro ao criar professor:', error);
        res.status(500).json({ error: 'Erro interno ao criar professor' });
    }
});

// Autenticação de login para o professor
app.post('/login', async (req, res) => {
    try {
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

        const token = jwt.sign(
            { id: professor.id, email: professor.email },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        console.error('Erro ao autenticar login:', error);
        res.status(500).json({ error: 'Erro interno ao autenticar login' });
    }
});

// Middleware de autenticação para rotas protegidas
const autenticarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
};

// Buscar perfil do professor autenticado
app.get('/perfil', autenticarToken, async (req, res) => {
    try {
        const professor = await prisma.professor.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, age: true, telefone: true, universityId: true, subject: true }
        });

        if (!professor) {
            return res.status(404).json({ error: 'Professor não encontrado' });
        }

        res.status(200).json(professor);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro interno ao buscar perfil' });
    }
});

// Atualizar dados do professor (após login)
app.put('/professores/:id', autenticarToken, async (req, res) => {
    const { id } = req.params;
    const { nome, age, telefone, universityId, disciplina, email, password } = req.body;

    try {
        const professorExiste = await prisma.professor.findUnique({
            where: { id },
        });

        if (!professorExiste) {
            return res.status(404).json({ error: 'Professor não encontrado' });
        }

        let dataUpdate = {
            name: nome,
            age: age !== undefined && age !== null ? String(age) : null,
            telefone,
            universityId,
            subject: disciplina,
            email
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

// Deletar um professor (somente autenticado)
app.delete('/professores/:id', autenticarToken, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.professor.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar professor:', error);
        res.status(500).json({ error: 'Erro interno ao deletar professor' });
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
