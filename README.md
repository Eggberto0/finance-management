# 💰 Financer

> Controle financeiro pessoal, do jeito que você quiser.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)

O Financer nasceu da insatisfação com apps financeiros pagos, limitados ou sem personalização. É um sistema de controle financeiro pessoal construído do zero, pensado para quem quer ter visibilidade real do próprio dinheiro.

---

## ✨ Funcionalidades

- **Contas** — corrente, poupança, investimentos, carteiras em moeda estrangeira e benefícios (VR, VA)
- **Cartões de crédito** — gestão de fatura mensal, limite disponível e pagamento com um clique
- **Lançamentos** — receitas, despesas e transferências com categorias, tags, parcelas e status
- **Recorrentes** — regras automáticas com suporte a dias úteis e feriados nacionais
- **Orçamento mensal** — limites por categoria com alertas visuais
- **Cofrinhos** — metas de economia com progresso e vínculo a contas
- **Dashboard** — visão geral com patrimônio, alertas de atraso, prévia de faturas e cofrinhos
- **Cotação automática** — conversão em tempo real para contas em moeda estrangeira
- **Dark mode** — alternância entre modo claro e escuro com persistência
- **Multi-login** — Google e e-mail/senha

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Estilização | TailwindCSS 4 |
| Banco de dados | Firebase Firestore |
| Autenticação | Firebase Authentication |
| Cotação | AwesomeAPI |
| Deploy | Docker + Nginx |

---

## 🚀 Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org) 18+
- [Docker](https://www.docker.com) (opcional)
- Conta no [Firebase](https://console.firebase.google.com)

### Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o **Firestore Database** e o **Authentication** (Google + E-mail/senha)
3. Registre um app web e copie as credenciais

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

> ⚠️ Nunca commite o arquivo `.env` com suas credenciais reais.

### Rodando localmente
```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

Acesse em `http://localhost:5173`

### Rodando com Docker
```bash
# Build da imagem
docker build -t financer .

# Rodar o container
docker run -p 8080:80 financer
```

Acesse em `http://localhost:8080`

---

## 📁 Estrutura do projeto
```
src/
├── components/     # Componentes reutilizáveis
├── contexts/       # Contexto de autenticação
├── hooks/          # Hooks de dados e lógica
├── pages/          # Telas da aplicação
├── services/       # Configuração do Firebase
└── utils/          # Utilitários e cálculos
```

---

## 🔒 Segurança

Os dados são protegidos por regras do Firestore que garantem que cada usuário acessa **somente os próprios dados**. Nenhum dado é compartilhado entre contas.

---

## 📌 Roadmap

- [ ] Importação de extratos OFX/CSV
- [ ] Módulo de investimentos
- [ ] Anexar comprovantes nos lançamentos
- [ ] PWA — instalação como app no celular
- [ ] Lançamentos históricos retroativos

---

Feito por Erick Ribeiro.