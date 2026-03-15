<div align="center">

# 🗺️ ROTA
### Registro Organizado de Trajetos e Acomodações

**Plataforma de turismo brasileira que conecta turistas, empresas de turismo, hotéis e restaurantes.**

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-Aiven-4479A1?style=for-the-badge&logo=mysql)](https://aiven.io)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

[🌐 Demo ao vivo](#) · [📋 Documentação](#funcionalidades) · [🐛 Reportar bug](https://github.com/TioRael/rota/issues)

</div>

---

## 📖 Sobre o Projeto

O **ROTA** é um projeto acadêmico desenvolvido no **Módulo 5** do curso de **Análise e Desenvolvimento de Sistemas**. O objetivo é construir uma plataforma completa de turismo brasileiro, aplicando na prática os conceitos de:

- Banco de dados relacional (MySQL)
- Desenvolvimento web full-stack (Next.js 16 + TypeScript)
- Autenticação segura (NextAuth.js + bcrypt)
- Deploy em produção (Vercel + Aiven)

### 🎯 O problema que resolve

O Brasil possui destinos turísticos incríveis, mas carecia de uma plataforma nacional que conectasse turistas às empresas locais de forma organizada. O ROTA centraliza rotas, hospedagens, restaurantes e reservas em um único lugar.

---

## ✨ Funcionalidades

### 🧳 Para Turistas
- Cadastro e autenticação com sessão JWT
- Busca e filtro de rotas turísticas (categoria, região, duração)
- Página de detalhe com itinerário, guias e serviços
- Reserva de passeios com cálculo automático de valor
- Busca e filtro de hotéis e pousadas
- Reserva de hospedagem com cálculo por noite
- Listagem de restaurantes por região e tipo de cozinha
- Sistema de avaliações (1 a 5 estrelas + comentário)
- Painel pessoal com reservas e histórico
- Edição de perfil e contato de emergência

### 🏢 Para Empresas de Turismo
- Cadastro com CNPJ e Razão Social
- Painel de gestão de rotas cadastradas
- Cadastro e gerenciamento de guias
- Visualização de reservas recebidas
- Estatísticas (total de reservas, avaliação média)

### ⚙️ Para Administradores
- Dashboard com estatísticas gerais do sistema
- Gráfico de crescimento de usuários
- Listagem e busca de todos os usuários
- Ativar/desativar contas
- Visualização de todas as reservas
- Moderação de avaliações

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.x |
| Linguagem | TypeScript | 5.x |
| Banco de Dados | MySQL (Aiven Cloud) | 8.x |
| ORM/Query | mysql2 | 3.x |
| Autenticação | NextAuth.js | 4.x |
| Hash de senha | bcryptjs | 2.x |
| Estilização | Tailwind CSS + CSS custom | 3.x |
| Deploy | Vercel | — |

---

## 🗄️ Modelagem do Banco de Dados

O banco `rota` possui **13 tabelas** interligadas por chaves estrangeiras:

```
TABELA_USUARIOS
TABELA_EMPRESAS_TURISMO
TABELA_REGIOES
TABELA_ROTAS
TABELA_PONTOS
TABELA_ROTA_PONTOS        (N:N — rotas × pontos)
TABELA_GUIAS
TABELA_SERVICOS
TABELA_ACOMODACOES
TABELA_RESTAURANTES
TABELA_RESERVAS_ACOMODACAO
TABELA_RESERVAS_ROTAS
TABELA_AVALIACOES
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no [Aiven](https://aiven.io) com MySQL configurado

### 1. Clone o repositório

```bash
git clone https://github.com/TioRael/rota.git
cd rota
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de Dados — Aiven MySQL
DB_HOST=seu-host.aivencloud.com
DB_PORT=19343
DB_USER=avnadmin
DB_PASSWORD=sua_senha_aqui
DB_NAME=rota

# Certificado SSL (conteúdo do ca.pem para produção)
# DB_SSL_CA=

# NextAuth
NEXTAUTH_SECRET=gere_com_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
```

> ⚠️ **NUNCA** commite o `.env.local`. Ele já está no `.gitignore`.

### 4. Configure o banco de dados

Execute os scripts SQL no Query Editor do Aiven **nesta ordem**:

```bash
# 1. Cria todas as tabelas
rota_banco.sql

# 2. Insere dados iniciais (rotas, pontos, guias, serviços)
seed_dados_reais.sql

# 3. Insere acomodações e restaurantes
seed_hoteis_restaurantes.sql

# 4. Cria usuário admin e ajusta ENUMs
seed_admin.sql
```

### 5. Execute o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Estrutura do Projeto

```
rota/
├── app/                          # App Router do Next.js
│   ├── page.tsx                  # Home pública
│   ├── layout.tsx                # Layout raiz
│   ├── globals.css               # Paleta Tropicália + estilos globais
│   │
│   ├── (rotas públicas)
│   ├── rotas/                    # Listagem e detalhe de rotas
│   ├── hoteis/                   # Listagem e detalhe de hotéis
│   ├── restaurantes/             # Listagem e detalhe de restaurantes
│   ├── sobre/                    # Página sobre o projeto
│   ├── contato/                  # Formulário de contato
│   ├── termos/                   # Termos de uso
│   ├── privacidade/              # Política de privacidade (LGPD)
│   │
│   ├── (rotas autenticadas)
│   ├── auth/                     # Login e cadastro
│   ├── dashboard/                # Painel do turista e empresa
│   ├── perfil/                   # Edição de perfil
│   ├── admin/                    # Painel administrativo
│   │
│   └── api/                      # Route Handlers (backend)
│       ├── auth/                 # NextAuth + cadastro
│       ├── rotas/                # CRUD rotas
│       ├── hoteis/               # CRUD acomodações
│       ├── restaurantes/         # CRUD restaurantes
│       ├── dashboard/            # Dados dos painéis
│       ├── perfil/               # Atualização de perfil
│       └── admin/                # APIs do painel admin
│
├── components/                   # Componentes reutilizáveis
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── SessionProvider.tsx
│
├── lib/                          # Lógica compartilhada
│   ├── db.ts                     # Conexão MySQL (pool + SSL)
│   ├── auth.ts                   # Configuração NextAuth
│   └── types.ts                  # Interfaces TypeScript
│
├── ca.pem                        # Certificado SSL Aiven (no .gitignore)
├── proxy.ts                      # Proteção de rotas (Next.js 16)
├── next.config.ts                # Configuração Next.js
└── tailwind.config.ts            # Paleta Tropicália
```

---

## 🔐 Segurança

- ✅ Senhas armazenadas com **bcrypt** (salt rounds = 12)
- ✅ Autenticação via **JWT** com expiração de 7 dias
- ✅ Conexão MySQL com **SSL obrigatório** (certificado CA do Aiven)
- ✅ Credenciais exclusivamente via **variáveis de ambiente**
- ✅ Proteção de rotas via **proxy.ts** (TURISTA / EMPRESA / ADMIN)
- ✅ Validação de inputs no servidor em todas as APIs
- ✅ Conformidade com a **LGPD** (Lei 13.709/2018)

---

## 🌈 Identidade Visual — Paleta Tropicália

| Cor | Hex | Uso |
|-----|-----|-----|
| 🟠 Laranja Manga | `#FF6B1A` | CTA, botões primários, destaques |
| 🟢 Verde Palmeira | `#2ECC71` | Títulos, natureza, sucesso |
| 🔵 Azul Turquesa | `#00BCD4` | Links, mar, informações |
| ⬜ Branco Puro | `#FFFFFF` | Fundos de cards |
| 🟡 Creme Suave | `#FFFDF7` | Fundo das páginas |

**Tipografia:** Baloo 2 (display/títulos) + Nunito (corpo/UI)

---

## 🚀 Deploy na Vercel

### 1. Configure as variáveis de ambiente no painel da Vercel

Acesse **Project Settings → Environment Variables** e adicione:

```
DB_HOST         → seu-host.aivencloud.com
DB_PORT         → 19343
DB_USER         → avnadmin
DB_PASSWORD     → sua_senha
DB_NAME         → rota
DB_SSL_CA       → (conteúdo completo do ca.pem)
NEXTAUTH_SECRET → (gere com: openssl rand -base64 32)
NEXTAUTH_URL    → https://seu-dominio.vercel.app
```

> 💡 Para o `DB_SSL_CA`, copie todo o conteúdo do arquivo `ca.pem` (incluindo as linhas `-----BEGIN CERTIFICATE-----` e `-----END CERTIFICATE-----`) e cole como valor da variável.

### 2. Deploy automático

Todo push para a branch `main` dispara um deploy automático na Vercel.

```bash
git add .
git commit -m "feat: projeto ROTA completo"
git push origin main
```

---

## 👥 Equipe

| Nome | Papel | GitHub |
|------|-------|--------|
| Israel Menezes | Desenvolvedor Full-Stack | [@TioRael](https://github.com/TioRael) |
| Felipe | Desenvolvedor Front-End | — |
| Roberta | Analista e Documentação | — |

**Curso:** Análise e Desenvolvimento de Sistemas — Módulo 5

---

## 📄 Licença

Este projeto é acadêmico e foi desenvolvido para fins educacionais.

---

<div align="center">

Feito com ☕ e 🇧🇷 pelo time ROTA

</div>