import express from 'express';
 import { PrismaClient } from '@prisma/client';
 import jwt from 'jsonwebtoken';
 import dotenv from 'dotenv';
 
 dotenv.config();
 
 const prisma = new PrismaClient();
 const app = express();
 app.use(express.json());
 
 const SECRET_KEY = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura';
 
 //  Middleware para autenticação com JWT
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
 
 //  Classe Builder para criar disciplinas
 class DisciplinaBuilder {
     constructor(name, professorId) {
         this.name = name;
         this.professorId = professorId;
     }
 
     async build() {
         // Verificar se o professor existe
         const professor = await prisma.professor.findUnique({
             where: { id: this.professorId }
         });
 
         if (!professor) {
             throw new Error('Professor não encontrado');
         }
 
         return { name: this.name, professorId: this.professorId };
     }
 }
 
 //  Criar uma matéria vinculada a um professor (rota protegida)
 app.post('/disciplinas', autenticarToken, async (req, res) => {
     const { name, professorId } = req.body;
 
     if (!name || !professorId) {
         return res.status(400).json({ error: 'Nome da disciplina e ID do professor são obrigatórios' });
     }
 
     try {
         const disciplinaData = await new DisciplinaBuilder(name, professorId).build();
 
         const disciplina = await prisma.discipline.create({
             data: disciplinaData,
             include: { professor: true }
         });
 
         res.status(201).json(disciplina);
     } catch (error) {
         if (error.message === 'Professor não encontrado') {
             return res.status(404).json({ error: error.message });
         }
 
         console.error('Erro ao criar disciplina:', error);
         res.status(500).json({ error: 'Erro interno ao criar disciplina' });
     }
 });
 
 //  Listar todas as disciplinas com os dados dos professores (rota protegida)
 app.get('/disciplinas', autenticarToken, async (req, res) => {
     const disciplinas = await prisma.discipline.findMany({
         include: { professor: true }
     });
 
     res.status(200).json(disciplinas);
 });
 
 //  Atualizar uma disciplina (rota protegida)
 app.put('/disciplinas/:id', autenticarToken, async (req, res) => {
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
 
 //  Deletar uma disciplina (rota protegida)
 app.delete('/disciplinas/:id', autenticarToken, async (req, res) => {
     const { id } = req.params;
 
     try {
         await prisma.discipline.delete({ where: { id } });
         res.status(204).send();
     } catch (error) {
         console.error('Erro ao deletar disciplina:', error);
         res.status(500).json({ error: 'Erro interno ao deletar disciplina' });
     }
 });
 
 //  Fechar conexão do Prisma ao encerrar o servidor
 process.on('SIGINT', async () => {
     console.log('Desconectando Prisma...');
     await prisma.$disconnect();
     process.exit();
 });
 
 app.listen(3000, () => {
     console.log('Servidor rodando na porta 3000');
 });
