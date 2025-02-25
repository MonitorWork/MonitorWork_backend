# MonitorWork Backend

## 📋 Descrição

O **MonitorWork** é um software projetado para conectar alunos com monitores de outras universidades e oferecer contato atráves da nossa pagina, no qual tem a função de ser um "placeholder

### Principais funcionalidades planejadas:
- **Cadastro de usuários**: Aluno, Monitor.
- **Validação de monitores**: Requer um universetyID.
- **Histórico de monitorias**: Registro das sessões realizadas, incluindo data, duração e participantes.
---

## 🚀 Começando

Siga as instruções abaixo para configurar o projeto localmente.

### 🛠️ Pré-requisitos

Certifique-se de ter os seguintes softwares instalados em sua máquina:
- **Node.js** (versão 16 ou superior)
- **EXPRESS** (FRAMEWORK)
- **npm** (gerenciador de pacotes do Node.js)
- **MongoDB** (banco de dados)
- **Prisma**(servidor HHTP)

---

### 🖥️ Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/MonitorWork/MonitorWork_backend.git
   cd MonitorWork_backend

2. **Instale as dependências:**
    ```bash
    npm install

3. **Configure as variáveis de ambiente:**
Crie um arquivo .env na raiz do projeto com as seguintes variáveis:
    ```env
     DATABASE_URL="mongodb+srv://matheusr:H9UUSWBaWteDO98z@cluster0.0gqsi.mongodb.net/Users?retryWrites=true&w=majority&appName=Cluster0"
4. **Configure o banco de dados:**
Certifique-se de que o mongodb está em execução e crie o banco de dados necessário:
    ```sql
   npx prisma db push
   npx prisma studio

5. **Inicie o servidor:**
    ```bash
    npm start

O servidor estará disponível em http://localhost:3000.

### 🔄  API - Endpoint de Exemplo
GET /api/example
Descrição: Endpoint de exemplo para verificar o funcionamento da API.
Resposta:
Status 200 (OK):
    ```json
   {"message": "API funcionando corretamente!"}

---

## 🌱 Branch Principal

A branch principal do projeto é a `main`. Esta branch deve conter apenas código funcional e pronto para produção. **Nunca faça commits diretamente na branch `main`!**


### 📚 Estrutura do Projeto
        ```bash
    MonitorWork_backend/
        ├── src/
        │   ├── controllers/    # Lógica dos controladores
        │   ├── models/         # Modelos de dados
        │   ├── routes/         # Definição de rotas
        │   ├── middlewares/    # Middleware para autenticação e validação
        │   ├── services/       # Regras de negócio
        │   └── app.js          # Configuração principal do app
        ├── .env                # Variáveis de ambiente
        ├── package.json        # Dependências e scripts
        └── README.md           # Documentação         
