[README-atendo-front.md](https://github.com/user-attachments/files/34633878/README-atendo-front.md)
# Atendo · Central de chamados (Front-end)

![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?logo=sass&logoColor=white)
![Status](https://img.shields.io/badge/status-demonstra%C3%A7%C3%A3o-7c6cff)

Front-end de um **sistema de chamados (helpdesk)** feito com **Angular** e **TypeScript**.
Baseado em um sistema de chamados que ajudei a desenvolver, foi **reescrito do zero**, com nova identidade
visual e uma arquitetura moderna. Roda sem back-end, com dados fictícios, e está pronto para ser integrado à
[API Laravel do projeto](https://github.com/cadumporfirio-boop/atendo-api).

<!-- Coloque seus prints na pasta docs/ e ajuste os nomes abaixo 
| Painel | Kanban | Andamento do chamado |
|---|---|---|
| ![Painel](docs/painel.png) | ![Kanban](docs/kanban.png) | ![Andamento](docs/andamento.png) |
-->
## ✨ Funcionalidades

- **Painel** com resumo por status, chamados por categoria e lista de atrasados
- **Kanban** com arrastar e soltar entre os status
- **Tabela** com busca, filtros, ordenação, fixar chamado e indicadores de prazo (1ª resposta e resolução)
- **Abertura e edição de chamados**: solicitante, departamento, responsáveis, plataforma, categoria,
  prioridade, prazo, empresa cliente, agendamento e anexos
- **Andamento do chamado**: chat com mensagens prontas, tempo gasto e notas internas, ao lado do resumo
  com metas de atendimento (SLA), pessoas, agendamento e classificação
- **Progresso do chamado**: linha do tempo com todas as etapas, da abertura à finalização
- **Notificações** com abas (não lidas/todas), filtros por categoria e marcar como lida
- **Meu perfil** com dados de contato e aniversário
- Login com rota protegida (guard)

## 🛠️ Tecnologias e decisões

| Recurso | Uso no projeto |
|---|---|
| Angular 19 com *standalone components* | sem NgModules, menos código repetido |
| **Signals** (`signal`, `computed`, `effect`) | estado reativo dos chamados, filtros e painéis |
| **Reactive Forms** | formulário completo de chamado e de perfil, com validações |
| Router com *lazy loading* | cada página carregada sob demanda |
| `CanActivateFn` | proteção das rotas internas |
| Camada de serviços isolada | trocar os dados fictícios por `HttpClient` sem mexer nas telas |
| SCSS com variáveis CSS | tema escuro e componentes responsivos |

## 🚀 Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) LTS.

```bash
git clone https://github.com/cadumporfirio-boop/atendo-front.git
cd atendo-front
npm install
npm start          # http://localhost:4200
```

Para gerar o build de produção: `npm run build` (saída em `dist/atendo-front`).
Na tela de login, qualquer e-mail e senha preenchidos entram na demonstração.

## 📁 Estrutura

```
src/app/
  core/     modelos, serviços (chamados, auth, notificações), guard e dados fictícios
  layout/   menu lateral e barra superior
  pages/    login, painel, kanban e tabela (carregadas sob demanda)
  shared/   andamento, progresso, formulário, notificações e perfil
```

## 🗺️ Próximos passos

- [ ] Integrar com a API Laravel (`HttpClient` e interceptor de autenticação)
- [ ] Testes automatizados
- [ ] Calendário, mural e conversas

## 👤 Autor

**Carlos Menin** · Desenvolvedor Full Stack Júnior
[GitHub](https://github.com/cadumporfirio-boop)
