import { Chamado, Evento, Mensagem } from './models';
import { dia } from './util';

const msg = (autor: string, texto: string, tipo: Mensagem['tipo'], dias: number): Mensagem => ({
  autor,
  texto,
  tipo,
  data: new Date(Date.now() + dias * 86400000).toISOString(),
});

/** Dados fictícios, gerados a partir da data atual para os prazos fazerem sentido. */
type Base = Omit<
  Chamado,
  'deptoSolicitante' | 'departamento' | 'plataforma' | 'agendamento' | 'anexos' | 'eventos'
>;

function base(): Base[] {
  return [
    {
      id: 1008, assunto: 'Erro ao acessar o painel administrativo', descricao: 'Ao entrar com meu usuário o painel fica em branco e aparece uma mensagem de erro.',
      empresa: 'Prefeitura Modelo', solicitante: 'Marcos Vieira', categoria: 'Acesso', prioridade: 'Alta', prazo: dia(1), termino: null,
      status: 'Em andamento', responsaveis: ['Bruno Lima'], fixado: true,
      mensagens: [msg('Marcos Vieira', 'Abertura do chamado com print do erro.', 'abertura', -2), msg('Bruno Lima', 'Consegui reproduzir, parece permissão do perfil.', 'resposta', -1)],
    },
    {
      id: 1007, assunto: 'Impressora do financeiro não imprime', descricao: 'Os documentos ficam parados na fila de impressão.',
      empresa: 'Construtora Alfa', solicitante: 'Elisa Prado', categoria: 'Hardware', prioridade: 'Média', prazo: dia(3), termino: null,
      status: 'Aberto', responsaveis: ['Carla Dias'], fixado: false,
      mensagens: [msg('Elisa Prado', 'Acontece desde ontem.', 'abertura', -1)],
    },
    {
      id: 1006, assunto: 'Lentidão no sistema de pedidos', descricao: 'As telas demoram mais de 30 segundos para carregar.',
      empresa: 'Loja Horizonte', solicitante: 'Paulo Reis', categoria: 'Sistema', prioridade: 'Alta', prazo: dia(-1), termino: null,
      status: 'Em andamento', responsaveis: ['Carla Dias', 'Diego Rocha'], fixado: true,
      mensagens: [msg('Paulo Reis', 'Começou ontem à tarde.', 'abertura', -4), msg('Carla Dias', 'Analisando consultas e uso do servidor.', 'resposta', -3)],
    },
    {
      id: 1005, assunto: 'Solicitação de novo usuário', descricao: 'Criar acesso para a nova pessoa da equipe comercial.',
      empresa: 'Clínica Vitta', solicitante: 'Renata Alves', categoria: 'Solicitação', prioridade: 'Baixa', prazo: dia(6), termino: null,
      status: 'Aguardando', responsaveis: ['Bruno Lima'], fixado: false,
      mensagens: [msg('Renata Alves', 'Preciso de um usuário com perfil de atendente.', 'abertura', -3), msg('Bruno Lima', 'Aguardando o envio do e-mail da pessoa.', 'resposta', -2)],
    },
    {
      id: 1004, assunto: 'Wi-Fi caindo na sala de reunião', descricao: 'A conexão cai a cada poucos minutos durante as reuniões.',
      empresa: 'Construtora Alfa', solicitante: 'Tiago Nunes', categoria: 'Rede', prioridade: 'Média', prazo: dia(-6), termino: dia(-7),
      status: 'Finalizado', responsaveis: ['Ana Souza'], fixado: false,
      mensagens: [msg('Tiago Nunes', 'Acontece principalmente à tarde.', 'abertura', -10), msg('Ana Souza', 'Trocamos o canal do roteador.', 'resposta', -8), msg('Ana Souza', 'Status alterado para Finalizado', 'status', -7)],
    },
    {
      id: 1003, assunto: 'Dúvida sobre anexos no chamado', descricao: 'Qual o tamanho máximo de arquivo que posso anexar?',
      empresa: 'Prefeitura Modelo', solicitante: 'Marcos Vieira', categoria: 'Dúvida', prioridade: 'Baixa', prazo: dia(-9), termino: dia(-10),
      status: 'Finalizado', responsaveis: ['Diego Rocha'], fixado: false,
      mensagens: [msg('Marcos Vieira', 'Quero anexar um PDF grande.', 'abertura', -12), msg('Diego Rocha', 'Explicado o limite e como compactar.', 'resposta', -11)],
    },
  ];
}

const DEPTOS = ['Suporte', 'Financeiro', 'Comercial', 'Desenvolvimento'];
const PLATAFORMAS = ['Plataforma Web', 'App Mobile', 'Integrações'];

export function mockChamados(): Chamado[] {
  return base().map((c, i): Chamado => {
    const abertura = c.mensagens[0].data;
    const eventos: Evento[] = [
      { tipo: 'abertura', autor: c.solicitante, texto: 'realizou a abertura do chamado', data: abertura },
      {
        tipo: 'atribuicao',
        autor: 'Sistema',
        texto: `atribuiu ${c.responsaveis.join(', ')}`,
        detalhe: `Departamento: ${DEPTOS[i % DEPTOS.length]}`,
        data: abertura,
      },
      ...c.mensagens.slice(1).map(
        (m): Evento => ({
          tipo: m.tipo === 'status' ? 'status' : 'resposta',
          autor: m.autor,
          texto: m.tipo === 'status' ? 'alterou o status do chamado' : 'respondeu ao chamado',
          data: m.data,
        }),
      ),
    ];
    return {
      ...c,
      deptoSolicitante: DEPTOS[(i + 1) % DEPTOS.length],
      departamento: DEPTOS[i % DEPTOS.length],
      plataforma: PLATAFORMAS[i % PLATAFORMAS.length],
      agendamento: i === 0 ? { inicio: dia(2) + 'T09:00', fim: dia(2) + 'T10:00', local: 'Sala de reuniões', descricao: 'Visita técnica' } : null,
      anexos: i === 0 ? ['print-do-erro.png'] : [],
      eventos,
    };
  });
}
