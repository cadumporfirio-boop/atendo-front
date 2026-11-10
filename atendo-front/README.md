# Atendo · Front-end (Angular + TypeScript)

Front-end de uma central de chamados (helpdesk), reescrito do zero em **Angular 19** com **TypeScript**,
componentes standalone, signals, rotas com lazy loading e formulários reativos.

Funciona **sem back-end**: os dados são fictícios e ficam em memória (`core/mock-data.ts`).
A camada de dados está isolada em `core/chamado.service.ts` e `core/auth.service.ts`;
para ligar a uma API, troque apenas os métodos desses serviços por chamadas `HttpClient`.

## Telas e recursos
- Login
- Painel (resumo, chamados por categoria, atrasados)
- Kanban (arrastar e soltar entre status) e Tabela (busca, filtros, ordenação, fixar, indicadores de prazo)
- Abertura e **edição** de chamado: solicitante, departamento, responsáveis, plataforma, prioridade, categoria, prazo, empresa cliente, agendamento, descrição e anexos
- **Andamento do chamado**: chat com mensagens prontas, tempo gasto e notas internas, ao lado do resumo (SLA, pessoas, agendamento, responsáveis, classificação)
- **Progresso do chamado**: linha do tempo com todas as etapas
- **Notificações**: painel com abas (não lidas/todas), filtros por categoria e marcar como lida
- **Meu perfil**: edição de nome, contato, empresa, departamento e aniversário

## Como rodar
```bash
npm install
npm start        # http://localhost:4200
npm run build    # gera dist/atendo-front
```
O roteamento usa hash (`#/painel`), então o build pode ser hospedado em qualquer lugar estático (Vercel, GitHub Pages).

## Estrutura
```
src/app/
  core/      modelos, serviços (auth, chamados), guard, dados fictícios
  layout/    shell (menu lateral + topo)
  pages/     login, painel, kanban, tabela (carregadas sob demanda)
  shared/    detalhe do chamado e formulário de novo chamado
```

## Próximos passos
- Este front usa dados fictícios e ainda **não** consome a API Laravel do repositório `atendo-api`.
  Para integrar, troque os métodos de `core/chamado.service.ts` e `core/auth.service.ts` por chamadas `HttpClient`
  (as rotas estão no README da API) e ajuste os modelos aos campos retornados.
