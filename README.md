# Dynamic QA - Sistema de Questionários Dinâmicos

<div align="center">
  
# Dynamic QA - Sistema de Questionários Dinâmicos

**Universidade Federal de Santa Catarina (UFSC)**  
**Campus Araranguá**  
**Curso de Engenharia de Computação**

</div>

Sistema de gerenciamento de questionários dinâmicos direcionados (mas não limitados) para triagem e avaliação clinica.

[![Download](https://img.shields.io/github/v/release/kallebkcs/dynamic_qa?label=Download%20.EXE&style=for-the-badge&color=28a745)](https://github.com/kallebkcs/dynamic_qa/releases/latest)

## Informações do Projeto

| Item                       | Informação                                                  |
| -------------------------- | ------------------------------------------------------------|
| **Autores**                |  Settimio Yoghna Bidjjoque Da Costa e Kalleb da Costa Santos|
| **Orientação**             | Professor Jim Lau                                           |
| **Disciplina**             | Projeto de Sistemas Ubíquos e Embarcados                    |
| **Semestre**               | 2026.1                                                      |
| **Tipo**                   | Projeto Acadêmico                                           |
| **Tecnologias Principais** | Node.js, Express.js, Vue.js e SQLite                        |

---

## Visão Geral

Este projeto consiste em um Sistema de Questionários Dinâmicos para Avaliação de Sarcopenia, desenvolvido para auxiliar profissionais da saúde na criação, aplicação e gerenciamento de questionários clínicos.

A aplicação possui uma interface intuitiva e de fácil utilização, permitindo que coordenadores e monitores realizem avaliações de forma organizada e eficiente.

O sistema utiliza uma arquitetura baseada em Node.js, Express.js, Vue.js e SQLite, proporcionando uma aplicação leve, rápida e de fácil implantação.

O acesso ao sistema é realizado por meio de autenticação de usuários, sendo que:

O Coordenador realiza seu próprio cadastro e gerencia o sistema.
Os Monitores são cadastrados exclusivamente pelo coordenador e possuem acesso às funcionalidades relacionadas à aplicação dos questionários.

Além da aplicação dos questionários, o sistema gera automaticamente um diagnóstico com base nas respostas fornecidas e disponibiliza relatórios completos das avaliações realizadas.

---

## Objetivos

O sistema foi desenvolvido com os seguintes objetivos:

* Cadastro e gerenciamento de coordenadores;
* Cadastro de monitores realizado pelo coordenador;
* Criação e gerenciamento de questionários dinâmicos;
* Aplicação de questionários aos pacientes;
* Geração automática do resultado da avaliação (**Positivo** ou **Negativo**) com base nas respostas do questionário;
* Armazenamento do histórico das avaliações realizadas;
* Emissão de relatórios individuais das avaliações dos pacientes.

---

## Contexto Acadêmico

Este projeto foi desenvolvido como trabalho final da disciplina **Projeto de Sistemas Ubíquos e Embarcados**, do curso de **Engenharia de Computação**.

Seu principal objetivo é aplicar, de forma integrada, conhecimentos adquiridos ao longo do curso nas áreas de desenvolvimento de software, bancos de dados, interfaces web e sistemas computacionais, propondo uma solução tecnológica para apoiar o processo de avaliação de sarcopenia por meio da digitalização dos questionários e da automatização da geração de diagnósticos e relatórios.

---

# Estrutura do Projeto

```text
dynamic_qa/
│
├── backend/                  # API REST (Node.js + Express)
│   ├── controllers/          # Regras de negócio
│   ├── middleware/           # Autenticação e validações
│   ├── models/               # Modelos do banco
│   ├── routes/               # Rotas da API
│   ├── database/             # Configuração do SQLite
│   ├── services/             # Serviços da aplicação
│   └── server.js             # Inicialização da API
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── AvisoToast.vue
│   │   │   ├── BlocoLogica.vue
│   │   │   ├── ConfirmModal.vue
│   │   │   ├── TipoEscolha.vue
│   │   │   ├── TipoEquacao.vue
│   │   │   └── TipoNumerico.vue
│   │   │
│   │   ├── views/            # Páginas da aplicação
│   │   │   ├── LoginView.vue
│   │   │   ├── CadastroView.vue
│   │   │   ├── HomeView.vue
│   │   │   ├── AdministradorView.vue
│   │   │   ├── CoordenadorView.vue
│   │   │   ├── MonitorView.vue
│   │   │   ├── CriacaoQuestionarioView.vue
│   │   │   ├── QuestionarioView.vue
│   │   │   └── VisualizarRespostasView.vue
│   │   │
│   │   ├── router/
│   │   │   └── index.js
│   │   │
│   │   ├── utils/
│   │   │   └── presetQuestions.js
│   │   │
│   │   ├── App.vue
│   │   └── main.js
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── package.json
```
---
## Funcionalidades
* Criação e edição de questionários com cálculo de pesos e equações.
* Importação e exportação direta de arquivos `.json`.
* Validação automática de estrutura.
* Banco de dados local embutido e auto-configurável.

## Como usar
1. Clique no botão de **Download .EXE** acima.
2. Baixe o instalador da versão mais recente.
3. Instale e pronto. O sistema é inicializado com o questionário de Sarcopenia e suas variações.

## Tecnologias
Vue.js, Node.js, Express, SQLite, Electron.
