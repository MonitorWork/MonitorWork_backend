import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*", // Permite requisições de qualquer origem (modifique conforme necessário)
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos HTTP permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Cabeçalhos permitidos
  })
);
// Criar um novo professor
app.post("/professores", async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;

    // Verificar se todos os campos obrigatórios foram informados
    if (!nome || !email || !telefone) {
      return res
        .status(400)
        .json({ error: "Nome, email e telefone são obrigatórios" });
    }

    // Verificar se já existe um professor com o mesmo email
    const professorExistente = await prisma.professor.findUnique({
      where: { email },
    });

    if (professorExistente) {
      return res
        .status(400)
        .json({ error: "Já existe um professor com esse email." });
    }

    // Criar um novo professor
    const novoProfessor = await prisma.professor.create({
      data: {
        nome,
        email,
        telefone,
      },
    });

    // Retornar o professor criado
    res.status(201).json(novoProfessor);
  } catch (error) {
    console.error("Erro ao criar professor:", error);
    res.status(500).json({ error: "Erro interno ao criar professor" });
  }
});

// Criar uma nova disciplina e associar um professor a ela
app.post("/disciplinas", async (req, res) => {
  try {
    const { name, professorId } = req.body;

    // Verificar se todos os campos obrigatórios foram informados
    if (!name || !professorId) {
      return res.status(400).json({
        error: "Nome da disciplina e ID do professor são obrigatórios",
      });
    }

    // Verificar se o professor existe
    const professor = await prisma.professor.findUnique({
      where: { id: professorId },
    });

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    // Criar a disciplina e associar ao professor
    const disciplina = await prisma.discipline.create({
      data: {
        name,
        professor: {
          connect: { id: professorId },
        },
      },
    });

    // Retornar a disciplina criada
    res.status(201).json(disciplina);
  } catch (error) {
    console.error("Erro ao criar disciplina:", error);
    res.status(500).json({ error: "Erro interno ao criar disciplina" });
  }
});

// Listar todas as disciplinas com seus respectivos professores
app.get("/disciplinas", async (req, res) => {
  try {
    const disciplinas = await prisma.discipline.findMany({
      include: { professor: true },
    });

    // Retornar a lista de disciplinas com o professor associado
    res.status(200).json(disciplinas);
  } catch (error) {
    console.error("Erro ao listar disciplinas:", error);
    res.status(500).json({ error: "Erro interno ao listar disciplinas" });
  }
});

// Atualizar uma disciplina e associar um novo professor (se necessário)
app.put("/disciplinas/:id", async (req, res) => {
  const { id } = req.params;
  const { name, professorId } = req.body;

  try {
    const disciplinaAtualizada = await prisma.discipline.update({
      where: { id },
      data: {
        name,
        professor: professorId ? { connect: { id: professorId } } : undefined,
      },
      include: { professor: true },
    });

    // Retornar a disciplina atualizada
    res.status(200).json(disciplinaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar disciplina:", error);
    res.status(500).json({ error: "Erro interno ao atualizar disciplina" });
  }
});

// Deletar uma disciplina
app.delete("/disciplinas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.discipline.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar disciplina:", error);
    res.status(500).json({ error: "Erro interno ao deletar disciplina" });
  }
});

// Fechar conexão do Prisma ao encerrar o servidor
process.on("SIGINT", async () => {
  console.log("Desconectando Prisma...");
  await prisma.$disconnect();
  process.exit();
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
