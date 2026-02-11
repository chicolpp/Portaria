# Documentação do Sistema de Portaria

Este documento fornece detalhes técnicos, instruções de instalação e explicação das funcionalidades do sistema de Gerenciamento de Portaria.

## 1. Visão Geral

O sistema é uma aplicação web completa (Full Stack) para gerenciamento de condomínios, focada nas atividades de portaria, como controle de acesso, encomendas, reservas de espaços e ocorrências.

### Arquitetura Tech Stack

*   **Frontend**: React (v19) com Vite.
*   **Backend**: API em Python com Flask.
*   **Banco de Dados**: SQLAlchemy (compatível com SQLite para dev e PostgreSQL para produção).
*   **Estilização**: CSS Modules / Arquivos CSS dedicados por componente.

---

## 2. Instalação e Configuração

### Pré-requisitos
*   Node.js (v18+)
*   Python (v3.10+)
*   Git

### Passo 1: Configurar o Backend (API)

1.  Navegue até a pasta `api`:
    ```bash
    cd api
    ```
2.  Crie um ambiente virtual (recomendado):
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    ```
3.  Instale as dependências:
    ```bash
    pip install -r requirements.txt
    ```
4.  Inicie o servidor Flask:
    ```bash
    python app.py
    ```
    *   O servidor rodará em `http://localhost:5000`.
    *   Na primeira execução, ele criará automaticamente o banco de dados e um usuário admin padrão (`admin@portaria.com` / `admin123`).

### Passo 2: Configurar o Frontend

1.  Em um novo terminal, navegue até a raiz do projeto (onde está o `package.json`):
    ```bash
    cd c:\react\vite-teste
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    *   O frontend rodará em `http://localhost:5173`.
    *   O Vite está configurado para redirecionar chamadas de API (`/api/*` ou rotas específicas) para o backend na porta 5000.

---

## 3. Funcionalidades e Módulos

### 🔐 Autenticação (`/login`)
*   Sistema de login via JWT (JSON Web Token).
*   Controle de sessão e expiração de token.
*   **Componente**: `src/pages/Login.jsx`

### 👥 Gestão de Usuários
*   Cadastro completo de moradores e funcionários.
*   Upload de foto de perfil.
*   Definição de cargos (porteiro, administrador, etc.).
*   **Componente**: `src/pages/CadastroUsuarios.jsx`

### 📦 Controle de Encomendas
*   Registro de recebimento de encomendas.
*   Baixa de encomendas com registro de quem retirou.
*   Assinatura digital na retirada (se implementado no front) ou registro de nome.
*   **Componentes**: `Encomendas.jsx`, `CadastroEncomendas.jsx`

### 🚧 Portaria e Acesso
*   Registro de entrada e saída de visitantes.
*   Dados de veículo (Placa, Modelo, Cor).
*   **Componente**: `src/pages/Portaria.jsx`

### ⚠️ Ocorrências (Livro Negro)
*   Registro de infrações ou ocorrências no condomínio.
*   Relaciona unidade infratora e motivo.
*   **Componentes**: `Ocorrencias.jsx`, `Livrodeocorrencia.jsx`

### 🔑 Chaves e Itens
*   Controle de empréstimo de chaves de áreas comuns.
*   Empréstimo de itens do condomínio (Escadas, Carrinhos, Ferramentas).
*   **Componente**: `src/pages/Areadeservicos.jsx`

### 📅 Reservas
*   Agendamento de espaços comuns (Salão de Festas, Churrasqueira).
*   **Componente**: `src/pages/EspacosServicos.jsx`

---

## 4. API Endpoints (Backend)

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **AUTH** | | |
| `POST` | `/login` | Autentica usuário e retorna Token JWT |
| `POST` | `/register` | Registra novo usuário (Admin) |
| **USUÁRIOS** | | |
| `GET` | `/usuarios` | Lista todos os usuários |
| `PUT` | `/usuarios/<id>` | Edita usuário |
| `DELETE` | `/usuarios/<id>` | Remove usuário |
| **ENCOMENDAS** | | |
| `GET` | `/encomendas` | Lista encomendas |
| `POST` | `/encomendas` | Cria nova encomenda |
| `POST` | `/encomendas/<id>/retirar` | Registra retirada de encomenda |
| **ACESSOS** | | |
| `GET` | `/acessos` | Lista histórico de acessos |
| `POST` | `/acessos` | Registra nova entrada |
| `POST` | `/acessos/<id>/saida` | Registra saída |
| **RECURSOS** | | |
| `GET` | `/chaves` | Lista chaves |
| `GET` | `/itens` | Lista itens de empréstimo |
| `GET` | `/reservas/hoje` | Lista reservas do dia |

---

## 5. Estrutura de Diretórios Importantes

*   `api/app.py`: Core da aplicação Backend. Define todas as rotas.
*   `api/models.py`: Definição das tabelas do banco de dados (SQLAlchemy).
*   `src/pages/`: Contém as telas principais da aplicação React.
*   `src/components/`: Componentes reutilizáveis (Header, Toast, etc).
*   `vite.config.js`: Configuração do proxy reverso para desenvolvimento.

---

> **Nota**: O arquivo `README.md` original na raiz do projeto parece conter conflitos de merge (`<<<<<<< HEAD`). Recomenda-se resolvê-los para manter o histórico limpo.
