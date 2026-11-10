export type Status = 'Aberto' | 'Em andamento' | 'Aguardando' | 'Finalizado';
export type Prioridade = 'Baixa' | 'Média' | 'Alta';
export type SlaEstado = 'cumprido' | 'pendente' | 'violado';

export const STATUS_LISTA: Status[] = ['Aberto', 'Em andamento', 'Aguardando', 'Finalizado'];
export const PRIORIDADES: Prioridade[] = ['Baixa', 'Média', 'Alta'];
export const CATEGORIAS: string[] = ['Acesso', 'Sistema', 'Rede', 'Hardware', 'Dúvida', 'Solicitação'];
export const ATENDENTES: string[] = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Rocha'];
export const DEPARTAMENTOS: string[] = ['Suporte', 'Financeiro', 'Comercial', 'Desenvolvimento'];
export const PLATAFORMAS: string[] = ['Plataforma Web', 'App Mobile', 'Integrações'];
export const EMPRESAS: string[] = ['Prefeitura Modelo', 'Construtora Alfa', 'Loja Horizonte', 'Clínica Vitta'];
export const MENSAGENS_PRONTAS: string[] = [
  'Recebemos o seu chamado e já estamos analisando.',
  'Poderia enviar mais detalhes ou um print do problema?',
  'Chamado finalizado. Qualquer dúvida, é só responder aqui.',
];

export interface Mensagem {
  autor: string;
  texto: string;
  data: string;
  tipo: 'abertura' | 'resposta' | 'status';
  interna?: boolean;
  tempoMin?: number;
}

export interface Evento {
  tipo: 'abertura' | 'atribuicao' | 'status' | 'resposta' | 'edicao';
  autor: string;
  texto: string;
  detalhe?: string;
  data: string;
}

export interface Agendamento {
  inicio: string;
  fim: string;
  local: string;
  descricao: string;
}

export interface Chamado {
  id: number;
  assunto: string;
  descricao: string;
  empresa: string;
  deptoSolicitante: string;
  solicitante: string;
  departamento: string;
  responsaveis: string[];
  plataforma: string;
  categoria: string;
  prioridade: Prioridade;
  prazo: string;
  termino: string | null;
  status: Status;
  fixado: boolean;
  agendamento: Agendamento | null;
  anexos: string[];
  mensagens: Mensagem[];
  eventos: Evento[];
}

/** Valores do formulário de abertura/edição de chamado. */
export interface NovoChamado {
  deptoSolicitante: string;
  solicitante: string;
  departamento: string;
  responsaveis: string[];
  plataforma: string;
  prioridade: Prioridade;
  categoria: string;
  prazo: string;
  empresa: string;
  agendar: boolean;
  agInicio: string;
  agFim: string;
  agLocal: string;
  agDescricao: string;
  assunto: string;
  descricao: string;
}

export interface Usuario {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  departamento: string;
  aniversarioDia: number | null;
  aniversarioMes: number | null;
  mostrarAniversario: boolean;
}

export type TipoNotificacao = 'chamado' | 'conversa' | 'mural' | 'agenda' | 'sistema';

export interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  texto: string;
  origem: string;
  data: string;
  lida: boolean;
  chamadoId?: number;
  acao?: string;
}
